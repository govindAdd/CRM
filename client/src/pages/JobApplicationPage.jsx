import { BriefcaseBusiness } from "lucide-react";
import { Suspense, lazy } from "react";
import Layout from "../layouts/Layout";

const StageWiseView = lazy(() => import("../components/jobTabs/StageWiseView"));

const JobApplicationPage = () => {
  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-[1600px] w-full mx-auto">
        <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl p-6 md:p-10 transition-colors">
          {/* Page Title */}
          <h1
            className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100 pb-4 flex items-center gap-2 flex-wrap"
            aria-label="Job Application Dashboard"
          >
            <BriefcaseBusiness className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
            Hiring and Onboarding Dashboard
          </h1>

          {/* Divider */}
          <hr className="mb-4 h-1 rounded bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 border-0" />

          {/* Stage-wise Stepper View */}
          <Suspense
            fallback={
              <div className="text-gray-500 dark:text-gray-400">
                Loading stages...
              </div>
            }
          >
            <StageWiseView />
          </Suspense>
        </div>
      </div>
    </Layout>
  );
};

export default JobApplicationPage;
