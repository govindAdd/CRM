import { useDispatch, useSelector } from "react-redux";
import { exportHRData as exportHRDataThunk } from "../../../store/hrSlice";
import { toast } from "react-toastify";


const useExportHRData = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.hr);


  const handleExportHRData = async (format = "excel") => {
    try {
      // 1. Dispatch the thunk
      const blob = await dispatch(exportHRDataThunk(format)).unwrap();

      // 2. Generate file name and extension
      const fileExtension = format === "csv" ? "csv" : "xlsx";
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `hr_records_${timestamp}.${fileExtension}`;

      // 3. Create a download link and trigger it
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // 4. Clean up
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Exported as ${fileExtension.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to export HR data.");
    }
  };

  return {
    handleExportHRData,
    loading,
  };
};

export default useExportHRData;
