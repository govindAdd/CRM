// Final Production++ Code for UserProfilePage with Alien UI, Debounced Search, Pagination, Animated Arrows

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { FiUser } from "react-icons/fi";
import { FaUsers, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import Layout from "../layouts/Layout";
import { fetchAllUsers } from "../store/userSlice";
import { useCurrentUser } from "../hooks/user/useCurrentUser";
import { useAllUsers } from "../hooks/user/useAllUsers";
import UserProfileCard from "../components/profile/UserProfileCard";
import AllUsersList from "../components/profile/AllUsersList";

const USERS_PER_PAGE = 5;

const UserProfilePage = () => {
  const dispatch = useDispatch();
  const { currentUser, status, error } = useCurrentUser();

  const privilegedRoles = ["admin", "superadmin", "manager", "hr"];
  const isPrivileged = privilegedRoles.includes(currentUser?.role);

  const {
    allUsers,
    allUsersStatus: usersStatus,
    allUsersError: usersError,
  } = useAllUsers({ autoFetch: false });

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleFetchUsers = () => {
    dispatch(fetchAllUsers());
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const fullName = user.fullName?.toLowerCase() || "";
      return (
        fullName.includes(debouncedQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
    });
  }, [allUsers, debouncedQuery]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const renderSkeleton = () => (
    <div className="max-w-4xl mx-auto mt-8 space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <Skeleton height={36} width={36} circle />
        <Skeleton height={36} width={180} />
      </div>
      <div className="alien-glass p-6 rounded-3xl border border-purple-500/20 space-y-5">
        <div className="flex items-center gap-6">
          <Skeleton circle height={84} width={84} />
          <div className="flex-1 space-y-2">
            <Skeleton height={20} width="50%" />
            <Skeleton height={16} width="30%" />
            <Skeleton height={16} width="20%" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} height={24} />
            ))}
        </div>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="max-w-2xl mx-auto text-center mt-20 text-red-500 text-lg">
      Failed to load profile: {error}
    </div>
  );

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  }, [currentPage, totalPages]);

  return (
    <Layout>
      <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white p-3 rounded-full shadow-lg">
            <FiUser className="text-2xl" />
          </div>
          <h1 className="text-4xl font-extrabold text-zinc-800 dark:text-white tracking-tight">
            My Profile
          </h1>
        </div>

        {status === "loading" && renderSkeleton()}
        {status === "failed" && renderError()}
        {status === "succeeded" && currentUser && <UserProfileCard user={currentUser} />}
      </div>

      {isPrivileged && (
        <div className="mt-16 p-6 md:p-10 max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FaUsers className="text-purple-600 dark:text-purple-300 text-xl" />
              <h2 className="text-3xl font-bold text-zinc-800 dark:text-white">
                All Users
              </h2>
            </div>
            <button
              onClick={handleFetchUsers}
              className="bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold shadow-xl transition-all duration-200"
            >
              Get Users
            </button>
          </div>

          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-3 mb-6 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
          />

          {usersStatus === "loading" && <Skeleton count={5} height={32} />}
          {usersStatus === "failed" && (
            <p className="text-red-500">Failed to load users: {usersError}</p>
          )}
          {usersStatus === "succeeded" && (
            <>
              <AllUsersList users={paginatedUsers} />
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-4 items-center">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-purple-600 dark:text-white shadow-md transition-all disabled:opacity-40"
                  >
                    <FaArrowLeft className="animate-bounce-left" />
                  </button>
                  <span className="text-sm text-zinc-500 dark:text-zinc-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-purple-600 dark:text-white shadow-md transition-all disabled:opacity-40"
                  >
                    <FaArrowRight className="animate-bounce-right" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Layout>
  );
};

export default UserProfilePage;
