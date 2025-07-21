import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useCreateLeaveRequest from "../../hooks/hr/leaveRequest/useCreateLeaveRequest";
import useApproveLeaveRequest from "../../hooks/hr/leaveRequest/useApproveLeaveRequest";
import useGetLeaveRequestsForApproval from "../../hooks/hr/leaveRequest/useGetLeaveRequestsForApproval";
import { formatDateTime } from "../../utils/formatDateTime";
import {
  Calendar,
  FileText,
  Clock,
  User2,
  SendHorizonal,
  CheckCircle2,
} from "lucide-react";

const leaveSchema = yup.object().shape({
  from: yup.string().required("From date is required"),
  to: yup
    .string()
    .required("To date is required")
    .test("is-after", "To date must be after From date", function (value) {
      const { from } = this.parent;
      return new Date(from) <= new Date(value);
    }),
  reason: yup.string().required("Reason is required"),
  type: yup
    .string()
    .oneOf(
      ["leave", "sick", "casual", "weekoff", "holiday", "other"],
      "Invalid leave type"
    )
    .required("Leave type is required"),
});

function LeaveRequests() {
  const auth = useSelector((state) => state.auth.user);

  const hasApprovePermission = useMemo(
    () => ["admin", "superadmin", "hr", "manager"].includes(auth?.role),
    [auth?.role]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(leaveSchema) });

  const { submitLeaveRequest, loading: submitLoading } =
    useCreateLeaveRequest();

  const { approveLeave } = useApproveLeaveRequest();

  const {
    leaveRequests,
    getStatus,
    getError,
    refetch: refetchLeaveRequests,
  } = useGetLeaveRequestsForApproval();

  const [approvingIndex, setApprovingIndex] = useState(null);

  const onSubmit = async (formData) => {
    const payload = {
      ...formData,
      createdBy: auth?.name,
      createdById: auth?._id,
    };
    try {
      await submitLeaveRequest({ id: auth?._id, data: payload });
      reset();
      refetchLeaveRequests(); // 🔁 Refresh after submit
    } catch (error) {
      console.error("Failed to submit leave request", error);
    }
  };

  const handleApprove = async (req, index) => {
    const employeeId = req.user?._id;
    if (!employeeId) return console.error("Invalid employee ID");

    try {
      setApprovingIndex(index);
      await approveLeave({ id: employeeId, leaveIndex: index });
      refetchLeaveRequests(); // 🔁 Refresh after approval
    } catch (error) {
      console.error("Failed to approve leave request", error);
    } finally {
      setApprovingIndex(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-10">
      {/* Leave Form */}
      <section className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-neutral-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          <SendHorizonal size={20} className="text-blue-500" /> Raise Leave
          Request
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div>
            <label className="label flex items-center gap-1">
              <Calendar size={16} className="text-emerald-500" /> From
            </label>
            <input type="date" {...register("from")} className="input" />
            {errors.from && <p className="error-text">{errors.from.message}</p>}
          </div>
          <div>
            <label className="label flex items-center gap-1">
              <Calendar size={16} className="text-rose-500" /> To
            </label>
            <input type="date" {...register("to")} className="input" />
            {errors.to && <p className="error-text">{errors.to.message}</p>}
          </div>
          <div className="col-span-full">
            <label className="label flex items-center gap-1">
              <FileText size={16} className="text-indigo-500" /> Reason
            </label>
            <input
              type="text"
              {...register("reason")}
              className="input"
              placeholder="Reason for leave"
            />
            {errors.reason && (
              <p className="error-text">{errors.reason.message}</p>
            )}
          </div>
          <div className="col-span-full">
            <label className="label flex items-center gap-1">
              <Clock size={16} className="text-yellow-500" /> Type
            </label>
            <select {...register("type")} className="input capitalize">
              <option value="">Select Type</option>
              <option value="leave">Leave</option>
              <option value="sick">Sick</option>
              <option value="casual">Casual</option>
              <option value="weekoff">WeekOff</option>
              <option value="holiday">Holiday</option>
              <option value="other">Other</option>
            </select>
            {errors.type && <p className="error-text">{errors.type.message}</p>}
          </div>
          <div className="col-span-full flex justify-end">
            <button
              type="submit"
              disabled={submitLoading || isSubmitting}
              className="btn-primary w-full sm:w-auto"
            >
              {submitLoading || isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </section>

      {/* Leave Table */}
      <section className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-neutral-700 overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <User2 size={20} className="text-purple-500" /> Leave Requests
        </h3>
        <table className="w-full text-sm text-left border border-gray-200 dark:border-neutral-700">
          <thead className="bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="th">From</th>
              <th className="th">To</th>
              <th className="th">Reason</th>
              <th className="th">Type</th>
              <th className="th">Status</th>
              <th className="th">Requested By</th>
              {hasApprovePermission && <th className="th">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {Array.isArray(leaveRequests) && leaveRequests.length > 0 ? (
              leaveRequests.map((req, idx) => (
                <tr
                  key={req._id || idx}
                  className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition"
                >
                  <td className="td">{formatDateTime(req.from)}</td>
                  <td className="td">{formatDateTime(req.to)}</td>
                  <td className="td">{req.reason}</td>
                  <td className="td capitalize">{req.type}</td>
                  <td className="td capitalize">
                    {req.status}
                    {req.approvedBy && (
                      <span className="block text-xs text-green-600">
                        by {req.approvedBy}
                      </span>
                    )}
                  </td>
                  <td className="td">{req.user?.email || "N/A"}</td>
                  {hasApprovePermission && (
                    <td className="td">
                      <button
                        onClick={() => handleApprove(req, idx)}
                        disabled={approvingIndex !== null || req.status !== "pending"}
                        className="btn-success flex items-center gap-1"
                      >
                        <CheckCircle2 size={16} className="text-white" />
                        {approvingIndex === idx ? "Approving..." : "Approve"}
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={hasApprovePermission ? 7 : 6}
                  className="td text-center text-gray-500 dark:text-gray-400 py-6"
                >
                  {getStatus === "loading"
                    ? "Loading leave requests..."
                    : getError
                      ? `Error: ${getError}`
                      : "No leave requests yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default LeaveRequests;
