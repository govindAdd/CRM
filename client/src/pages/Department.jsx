import React, { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FiLayers, FiPlus } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import AllDepartments from "../components/department/AllDepartments";
import CreateDepartment from "../components/department/CreateDepartment";
import Layout from "../layouts/Layout";

const Department = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <Layout>
      <div className="px-6 py-8 md:p-12 max-w-6xl mx-auto w-full">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <FiLayers className="text-3xl text-purple-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 uppercase tracking-wider">
              Departments
            </h1>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <FiPlus />
            Create New Department
          </button>
        </div>

        {/* Department List */}
        <AllDepartments />

        {/* Create Department Modal */}
        <Transition appear show={isModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={closeModal}>
            {/* Overlay */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
            </Transition.Child>

            {/* Modal Panel */}
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-200"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-150"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="relative w-full max-w-xl transform overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 shadow-xl transition-all">

                    {/* ✖️ Close Button */}
                    <button
                      onClick={closeModal}
                      className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
                      title="Close"
                    >
                      <IoClose className="text-2xl" />
                    </button>

                    {/* Form Content */}
                    <CreateDepartment onSuccess={closeModal} />
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </Layout>
  );
};

export default Department;
