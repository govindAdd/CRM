import React, { useState, useEffect, Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PiEye, PiEyeSlash, PiLockKeyBold } from "react-icons/pi";
import { useChangePassword } from "../hooks/user/useChangePassword";
import { motion, AnimatePresence } from "framer-motion";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { handleChangePassword, updateStatus } = useChangePassword();

  const [formState, setFormState] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [visibility, setVisibility] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const oldPasswordRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFormState({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setVisibility({ old: false, new: false, confirm: false });
      setTimeout(() => {
        oldPasswordRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleChange = (field) => (e) => {
    setFormState({ ...formState, [field]: e.target.value });
  };

  const toggleVisibility = (field) => () => {
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (formState.newPassword !== formState.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    try {
      await handleChangePassword(formState.oldPassword, formState.newPassword);
      onClose();
    } catch (error) {
      alert(error?.message || "Failed to update password");
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-white/10 backdrop-blur-md transition-all duration-300" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
                className="w-full max-w-md p-6 sm:p-8 bg-white border border-zinc-100 rounded-2xl shadow-2xl space-y-6"
              >
                <Dialog.Title className="text-lg sm:text-xl font-semibold text-zinc-800 flex items-center gap-3">
                  <PiLockKeyBold className="text-purple-500 text-xl" />
                  <span>Change Password</span>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {["oldPassword", "newPassword", "confirmPassword"].map((field) => (
                    <PasswordField
                      key={field}
                      placeholder={
                        field === "oldPassword"
                          ? "Old password"
                          : field === "newPassword"
                          ? "New password"
                          : "Confirm new password"
                      }
                      value={formState[field]}
                      onChange={handleChange(field)}
                      visible={
                        visibility[
                          field === "oldPassword"
                            ? "old"
                            : field === "newPassword"
                            ? "new"
                            : "confirm"
                        ]
                      }
                      toggle={toggleVisibility(
                        field === "oldPassword"
                          ? "old"
                          : field === "newPassword"
                          ? "new"
                          : "confirm"
                      )}
                      iconColor={
                        field === "oldPassword"
                          ? "text-purple-500"
                          : field === "newPassword"
                          ? "text-emerald-500"
                          : "text-pink-500"
                      }
                      inputRef={field === "oldPassword" ? oldPasswordRef : null}
                    />
                  ))}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateStatus === "loading"}
                      className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:brightness-105 transition disabled:opacity-50"
                    >
                      {updateStatus === "loading" ? "Updating..." : "Update"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Dialog>
    </Transition>
  );
};

const PasswordField = ({
  placeholder,
  value,
  onChange,
  visible,
  toggle,
  iconColor,
  inputRef,
}) => (
  <div className="relative">
    <input
      ref={inputRef}
      type={visible ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full pr-11 px-4 py-2.5 text-sm rounded-lg bg-zinc-50 text-zinc-800 border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-400 transition placeholder-zinc-400"
    />
    <div
      onClick={toggle}
      className={`absolute right-3 top-1/2 -translate-y-1/2 ${iconColor} hover:scale-110 transition cursor-pointer`}
    >
      {visible ? <PiEyeSlash size={20} /> : <PiEye size={20} />}
    </div>
  </div>
);

export default ChangePasswordModal;
