import React from "react";
import {
  Plus,
  RotateCw,
  Download,
  Search,
  ArrowDownToLine,
} from "lucide-react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

const RecordActions = ({
  handleSearch,
  handleModalOpen,
  handleExport,
  createLoading = false,
  Button,
  exportLoading,
}) => {
  const buttonBase = `
    relative rounded-xl p-2 transition-all flex items-center justify-center
    focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50
    hover:scale-[1.05] hover:shadow-lg
  `;

  const iconEffect = `
    transition-transform duration-200 group-hover:scale-110
  `;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Tippy content="Search Records" placement="bottom">
        <Button
          onClick={handleSearch}
          className={`${buttonBase} bg-teal-600 hover:bg-teal-700 text-white group`}
        >
          <Search size={18} className="group-hover:animate-pulse" />
        </Button>
      </Tippy>

      <Tippy content="Create New Record" placement="bottom">
        <Button
          onClick={handleModalOpen}
          disabled={createLoading}
          className={`${buttonBase} bg-purple-600 hover:bg-purple-700 text-white group`}
        >
          <Plus size={18} className={iconEffect} />
        </Button>
      </Tippy>

      <Tippy content="Export to Excel" placement="bottom">
        <Button
          onClick={handleExport}
          disabled={exportLoading}
          className={`${buttonBase} w-[40px] h-[40px] bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-black dark:text-white group`}
        >
          <Download
            size={18}
            className="absolute opacity-100 group-hover:opacity-0"
          />
          <ArrowDownToLine
            size={18}
            className="absolute opacity-0 group-hover:opacity-100"
          />
        </Button>
      </Tippy>

      <Tippy content="Refresh Records" placement="bottom">
        <Button
          onClick={handleSearch}
          className={`${buttonBase} bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-black dark:text-white group`}
        >
          <RotateCw
            size={18}
            className="group-hover:rotate-180 transition-transform duration-300"
          />
        </Button>
      </Tippy>
    </div>
  );
};

export default RecordActions;
