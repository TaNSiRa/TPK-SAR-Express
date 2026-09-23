/* ===========================================================================
   Titration F.A. (54_FA) / Titration T.A. (55_TA)
   สร้างตารางเก็บผลจาก Instrument_FF โดยตัดคอลัมน์ที่หน้าใหม่ไม่ใช้ออก
     - Temp_1 / Temp_2            (คอลัมน์ TEMP)
     - DilutionTime_1 / _2        (คอลัมน์ DILUTION TIMES)
     - RawData_1 / RawData_2      (คอลัมน์ RAW DATA)

   SELECT TOP 0 ... INTO  คือการ clone ชนิดข้อมูลจาก Instrument_FF มาตรง ๆ
   จะได้ไม่ต้องเดา datatype  (ตารางที่ได้จะไม่มี index/constraint ติดมาด้วย
   เหมือนกับ Instrument_FF ที่ก็ไม่มี)

   รันครั้งเดียวบน database SAR
   =========================================================================== */

IF OBJECT_ID('dbo.Instrument_FA', 'U') IS NULL
BEGIN
    SELECT TOP 0
        RequestSample_ID,
        ReqNo,
        JobType,
        Incharge,
        Branch,
        RequestSection,
        ReqDate,
        CustFull,
        SampleCode,
        SampleGroup,
        SampleType,
        SampleTank,
        SampleName,
        SamplingDate,
        AnalysisDueDate,
        SampleRemark,
        SampleAttachFile,
        Position,
        Mag,
        Temp,
        StdFactor,
        StdMax,
        StdMin,
        ItemNo,
        ItemName,
        RemarkNo,
        ItemStatus,
        UserAnalysis,
        UserAnalysisBranch,
        AnalysisDate,
        ResultSymbol_1,
        Result_1,
        ResultUnit_1,
        ResultRemark_1,
        ResultFile_1,
        ResultSymbol_2,
        Result_2,
        ResultUnit_2,
        ResultRemark_2,
        ResultFile_2
    INTO dbo.Instrument_FA
    FROM dbo.Instrument_FF;
END
GO

IF OBJECT_ID('dbo.Instrument_TA', 'U') IS NULL
BEGIN
    SELECT TOP 0
        RequestSample_ID,
        ReqNo,
        JobType,
        Incharge,
        Branch,
        RequestSection,
        ReqDate,
        CustFull,
        SampleCode,
        SampleGroup,
        SampleType,
        SampleTank,
        SampleName,
        SamplingDate,
        AnalysisDueDate,
        SampleRemark,
        SampleAttachFile,
        Position,
        Mag,
        Temp,
        StdFactor,
        StdMax,
        StdMin,
        ItemNo,
        ItemName,
        RemarkNo,
        ItemStatus,
        UserAnalysis,
        UserAnalysisBranch,
        AnalysisDate,
        ResultSymbol_1,
        Result_1,
        ResultUnit_1,
        ResultRemark_1,
        ResultFile_1,
        ResultSymbol_2,
        Result_2,
        ResultUnit_2,
        ResultRemark_2,
        ResultFile_2
    INTO dbo.Instrument_TA
    FROM dbo.Instrument_FF;
END
GO

/* ---------------------------------------------------------------------------
   หมายเหตุเรื่อง INDEX
   ---------------------------------------------------------------------------
   ตอนแรกสคริปต์นี้พยายามสร้าง index บน (RequestSample_ID, ItemStatus)
   แต่ SQL Server ตอบ Msg 1919 เพราะคอลัมน์พวกนี้ถูก clone มาเป็น LOB type
   (nvarchar(max) / varchar(max)) ซึ่งใช้เป็น key column ของ index ไม่ได้

   จึงเอาออก  ตอนนี้ Instrument_FA / Instrument_TA จึงไม่มี index
   ซึ่งตรงกับ Instrument_FF ที่ใช้งานอยู่ทุกวันนี้และก็ไม่มีเหมือนกัน
   ปริมาณข้อมูลระดับเดียวกับ F-F ไม่ต้องมี index ก็ทำงานได้

   ถ้าวันหน้าข้อมูลเยอะจนช้า ค่อยแปลงชนิดคอลัมน์ก่อนแล้วค่อยสร้าง index
   ดูขั้นตอนในไฟล์ 54_55_Titration_FA_TA_addindex_optional.sql
   --------------------------------------------------------------------------- */

/* ตรวจผล : ต้องได้ตารางละ 40 คอลัมน์ */
SELECT  t.name                AS TableName,
        COUNT(c.column_id)    AS ColumnCount
FROM    sys.tables t
JOIN    sys.columns c ON c.object_id = t.object_id
WHERE   t.name IN ('Instrument_FA', 'Instrument_TA', 'Instrument_FF')
GROUP BY t.name
ORDER BY t.name;
GO
