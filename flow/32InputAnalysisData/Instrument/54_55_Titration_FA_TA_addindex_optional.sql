/* ===========================================================================
   OPTIONAL - ไม่ต้องรันตอนนี้
   ---------------------------------------------------------------------------
   Instrument_FA / Instrument_TA ใช้งานได้ปกติโดยไม่มี index
   (Instrument_FF ที่ใช้อยู่ทุกวันนี้ก็ไม่มี)

   รันไฟล์นี้เฉพาะตอนที่ข้อมูลเยอะจนหน้า InputAnalysisDataPage เริ่มโหลดช้า
   เท่านั้น  และควรรันตอนไม่มีคนใช้งาน
   =========================================================================== */

/* --- STEP 1 : ดูก่อนว่าคอลัมน์ที่จะทำ index เป็นชนิดอะไรจริง ๆ ------------- */
SELECT  t.name                AS TableName,
        c.name                AS ColumnName,
        ty.name               AS DataType,
        c.max_length,
        c.is_nullable
FROM    sys.tables t
JOIN    sys.columns c   ON c.object_id = t.object_id
JOIN    sys.types   ty  ON ty.user_type_id = c.user_type_id
WHERE   t.name IN ('Instrument_FF', 'Instrument_FA', 'Instrument_TA')
  AND   c.name IN ('RequestSample_ID', 'ItemStatus')
ORDER BY t.name, c.name;
GO

/* --- STEP 2 : แปลงชนิดคอลัมน์ให้ index ได้ ---------------------------------
   max_length = -1 ใน STEP 1 แปลว่าเป็น nvarchar(max)/varchar(max) = index ไม่ได้
   จึงต้องย่อลงมาก่อน  ตารางยังว่างอยู่การแปลงจึงไม่มีความเสี่ยงข้อมูลหาย

   ถ้า STEP 1 บอกว่าเป็น varchar (ไม่ใช่ nvarchar) ให้เปลี่ยน nvarchar
   ข้างล่างเป็น varchar ให้ตรงกัน  ความยาวปรับได้ตามจริง
   ItemStatus ค่ายาวสุดคือ 'FINISH RECONFIRM' = 16 ตัว  ให้ 50 ก็เหลือเฟือ
   --------------------------------------------------------------------------- */
ALTER TABLE dbo.Instrument_FA ALTER COLUMN RequestSample_ID nvarchar(100) NULL;
ALTER TABLE dbo.Instrument_FA ALTER COLUMN ItemStatus       nvarchar(50)  NULL;
GO

ALTER TABLE dbo.Instrument_TA ALTER COLUMN RequestSample_ID nvarchar(100) NULL;
ALTER TABLE dbo.Instrument_TA ALTER COLUMN ItemStatus       nvarchar(50)  NULL;
GO

/* --- STEP 3 : สร้าง index -------------------------------------------------
   คู่นี้คือเงื่อนไขที่ flow ใช้จริงทั้งใน DELETE ก่อน INSERT
   และใน JOIN ของ Instrument_search{FA|TA}ForInput
   --------------------------------------------------------------------------- */
IF NOT EXISTS (SELECT 1 FROM sys.indexes
               WHERE name = 'IX_Instrument_FA_Sample'
                 AND object_id = OBJECT_ID('dbo.Instrument_FA'))
    CREATE INDEX IX_Instrument_FA_Sample
        ON dbo.Instrument_FA (RequestSample_ID, ItemStatus);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes
               WHERE name = 'IX_Instrument_TA_Sample'
                 AND object_id = OBJECT_ID('dbo.Instrument_TA'))
    CREATE INDEX IX_Instrument_TA_Sample
        ON dbo.Instrument_TA (RequestSample_ID, ItemStatus);
GO
