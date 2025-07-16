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
    <div className="flex flex-wrap gap-2">
      <Tippy content="Search">
        <Button onClick={handleSearch} className="bg-blue-600 text-white">
          <Search size={18} />
        </Button>
      </Tippy>

      <Tippy content="Create Record">
        <Button
          onClick={handleModalOpen}
          className="bg-green-600 text-white"
          disabled={createLoading}
        >
          <Plus size={18} />
        </Button>
      </Tippy>

      <Tippy content="Export to Excel">
        <Button
          onClick={handleExport}
          className="bg-gray-200"
          disabled={exportLoading}
        >
          <Download size={18} />
        </Button>
      </Tippy>

      <Tippy content="Refresh">
        <Button onClick={handleSearch} className="bg-gray-200">
          <RotateCw size={18} />
        </Button>
      </Tippy>
    </div>
  );
};

export default RecordActions;
