const express = require("express");
const router = express.Router();
const mssql = require("./mssql.js");
const ExcelJS = require('exceljs');

// Headers definition
const headers = [
    'ID', 'ReqNo', 'CustFull', 'ReviseNo', 'CreateReportDate',
    'PatternReport', 'ReportOrder', 'SampleNo', 'GroupNameTS', 'SampleGroup',
    'SampleType', 'SampleTank', 'SampleName', 'ProcessReportName', 'SamplingDate',
    'ItemNo', 'ItemName', 'ItemReportName', 'StdFactor', 'StdMin',
    'StdSymbol', 'StdMax', 'ControlRange', 'ResultIn', 'ResultReport',
    'Evaluation', 'ReportRejectRemark', 'ReportRemark', 'Incharge', 'InchargeTime',
    'SubLeader', 'SubLeaderTime', 'GL', 'GLTime', 'DGM',
    'DGMTime', 'JP', 'JPTime', 'ReportCompleteDate', 'NextApprover',
    'Comment1', 'Comment2', 'Comment3', 'Comment4', 'Comment5',
    'Comment6', 'Comment7', 'Comment8', 'Comment9', 'Comment10',
    'InchargeTime_0', 'SubLeaderRejectRemark_0', 'SubLeaderTime_0', 'GLRejectRemark_0', 'GLTime_0',
    'DGMRejectRemark_0', 'DGMTime_0', 'JPRejectRemark_0', 'JPTime_0', 'InchargeTime_1',
    'SubLeaderRejectRemark_1', 'SubLeaderTime_1', 'GLRejectRemark_1', 'GLTime_1', 'DGMRejectRemark_1',
    'DGMTime_1', 'JPRejectRemark_1', 'JPTime_1', 'InchargeTime_2', 'SubLeaderRejectRemark_2',
    'SubLeaderTime_2', 'GLRejectRemark_2', 'GLTime_2', 'DGMRejectRemark_2', 'DGMTime_2',
    'JPRejectRemark_2', 'JPTime_2', 'InchargeTime_3', 'SubLeaderRejectRemark_3', 'SubLeaderTime_3',
    'GLRejectRemark_3', 'GLTime_3', 'DGMRejectRemark_3', 'DGMTime_3', 'JPRejectRemark_3',
    'JPTime_3'
];

// Export Excel endpoint
router.post('/Export_Excel', async (req, res) => {
    try {
        const { customer, startDate, endDate } = req.body;

        if (!customer || !startDate || !endDate) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Query data using your mssql function
        const query = `
            SELECT *
            FROM [SAR].[dbo].[Routine_KACReport]
            WHERE SamplingDate >= '${startDate}'
              AND SamplingDate < DATEADD(day, 1, '${endDate}')
              AND CustFull = '${customer}'
            ORDER BY SamplingDate, SampleNo, ItemNo DESC;
        `;

        const result = await mssql.qurey(query);

        if (result === "err") {
            return res.status(500).json({ error: 'Database query error' });
        }

        const data = result.recordset;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'No data found' });
        }

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Report');

        // Add header row
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };

        // Add data rows
        data.forEach(item => {
            const row = headers.map(header => {
                const value = item[header];
                if (value === null || value === undefined) {
                    return '';
                }
                if (value instanceof Date) {
                    return value.toISOString();
                }
                return value.toString();
            });
            worksheet.addRow(row);
        });

        // Auto-fit columns
        worksheet.columns.forEach((column, index) => {
            let maxLength = headers[index].length;
            column.eachCell({ includeEmpty: false }, cell => {
                const cellLength = cell.value ? cell.value.toString().length : 0;
                if (cellLength > maxLength) {
                    maxLength = cellLength;
                }
            });
            column.width = maxLength < 10 ? 10 : maxLength + 2;
        });

        // Set response headers
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=Report_Export.xlsx'
        );

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;