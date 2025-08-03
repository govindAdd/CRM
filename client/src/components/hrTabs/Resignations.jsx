import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, UsersRound, RotateCw } from "lucide-react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

function Resignations() {
  const { resigned, loading } = useSelector((state) => state.hr);
  // const { handleSubmitResignation } = useGetResignedEmployees();

  // useEffect(() => {
  //   handleSubmitResignation();
  // }, [handleSubmitResignation]);

  return (
    <div className="p-4 space-y-4"> 
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <UsersRound className="w-6 h-6 text-blue-600" />
          Resigned Employees
        </div>
        <Tippy content="Refresh List">
          <button
            // onClick={handleSubmitResignation}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition"
            disabled={loading}
          >
            <RotateCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </Tippy>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : resigned.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          No resigned employees found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resigned.map((emp) => (
            <div
              key={emp._id}
              className="rounded-xl border border-gray-200 shadow-sm p-4 bg-white transition hover:shadow-md"
            >
              <div className="text-lg font-semibold text-gray-800">
                {emp.fullName}
              </div>
              <div className="text-sm text-gray-500">
                {emp.designation} — {emp.department}
              </div>
              <div className="text-sm mt-1">
                Resignation Date:{" "}
                <span className="font-medium text-red-500">
                  {new Date(emp.resignation?.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Resignations;