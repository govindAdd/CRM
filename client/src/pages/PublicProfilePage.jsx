import React from "react";
import { useParams } from "react-router-dom";
import { usePublicProfile } from "../hooks/user/usePublicProfile";
import  PublicProfile  from "../components/profile/PublicProfile";

const PublicProfilePage = () => {
  const { username } = useParams();
  const { employee, hr, loading, error } = usePublicProfile(username);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return <PublicProfile employee={employee} hr={hr} />;
};

export default PublicProfilePage;
