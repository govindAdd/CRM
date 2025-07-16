import React from "react";
import { Plus, RotateCw, Download, Search } from "lucide-react";
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
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Tippy content="Search Records" placement="bottom">
        <Button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all p-2"
          aria-label="Search Records"
        >
          <Search size={18} />
        </Button>
      </Tippy>

      <Tippy content="Create New Record" placement="bottom">
        <Button
          onClick={handleModalOpen}
          className="bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition-all p-2 disabled:opacity-50"
          disabled={createLoading}
          aria-label="Create Record"
        >
          <Plus size={18} />
        </Button>
      </Tippy>

      <Tippy content="Export to Excel" placement="bottom">
        <Button
          onClick={handleExport}
          className="bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-black dark:text-white rounded-lg transition-all p-2 disabled:opacity-50"
          disabled={exportLoading}
          aria-label="Export Data"
        >
          <Download size={18} />
        </Button>
      </Tippy>

      <Tippy content="Refresh Records" placement="bottom">
        <Button
          onClick={handleSearch}
          className="bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-black dark:text-white rounded-lg transition-all p-2"
          aria-label="Refresh"
        >
          <RotateCw size={18} />
        </Button>
      </Tippy>
    </div>
  );
};

export default RecordActions;
