import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


export const exportToPDF = (records, getStatusText) => {
  const doc = new jsPDF();
  const tableData = records.map(r => [
    r.date,
    getStatusText(r.status),
    r.clockIn ? new Date(r.clockIn).toLocaleTimeString() : "-",
    r.clockOut ? new Date(r.clockOut).toLocaleTimeString() : "-",
    r.remarks || "-"
  ]);

  autoTable(doc, {
    head: [["Date", "Status", "Clock In", "Clock Out", "Remarks"]],
    body: tableData,
  });

  doc.save("Attendance.pdf");
};
