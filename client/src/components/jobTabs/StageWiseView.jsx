import { useSearchParams } from "react-router-dom";
import { useMemo, useState, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Tippy from "@tippyjs/react";
import {
  CheckCircle,
  FilePlus,
  PhoneCall,
  Users,
  Video,
  BadgeCheck,
  UserCheck,
} from "lucide-react";
import CreateJob from "./CreateJob";
import MoveToNextStageForm from "./MoveToNextStageForm";
import FaceToFaceInterview from "./FaceToFaceInterview";
import VirtualInterview from "./VirtualInterview";
import Offered from "./Offered";
import OfferLetter from "./OfferLetter";

// === STAGES mapped to backend keys ===
const STAGES = [
  { key: "application_review", label: "Create", icon: FilePlus },
  { key: "telephone_interview", label: "Telephone Interview", icon: PhoneCall },
  { key: "face_to_face", label: "Face-to-Face", icon: Users },
  { key: "virtual_interview", label: "Virtual Interview", icon: Video },
  { key: "offered", label: "Offered", icon: BadgeCheck },
  { key: "onboarded", label: "Onboarding", icon: UserCheck },
];

// === Utility: Class Name Combiner ===
const cn = (...classes) => classes.filter(Boolean).join(" ");

const StageWiseView = () => {
  const [params, setParams] = useSearchParams();
  const stageParam = params.get("stage");

  // default to application_review if param invalid
  const currentStage = useMemo(
    () =>
      STAGES.some((s) => s.key === stageParam) ? stageParam : STAGES[0].key,
    [stageParam]
  );

  const currentIndex = useMemo(
    () => STAGES.findIndex((s) => s.key === currentStage),
    [currentStage]
  );

  const [applicationData, setApplicationData] = useState(null);

  const setStage = (stageKey) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("stage", stageKey);
      return next;
    });
  };

  const handleApplicationCreated = (data) => {
    setApplicationData(data);
    // use backend key
    setStage("telephone_interview");
  };

  const renderStageComponent = useMemo(() => {
    switch (currentStage) {
      case "application_review":
        return <CreateJob onSuccess={handleApplicationCreated} />;
      case "telephone_interview":
        return (
          <MoveToNextStageForm
            application={applicationData}
            onNext={(pickedStage) => setStage(pickedStage)}
          />
        );
      case "face_to_face":
        return <FaceToFaceInterview application={applicationData} onNext={(pickedStage) => setStage(pickedStage)}/>;
      case "virtual_interview":
        return <VirtualInterview application={applicationData} onNext={(pickedStage) => setStage(pickedStage)}/>;
      case "offered":
        return <Offered application={applicationData} onNext={(pickedStage) => setStage(pickedStage)} setParams={setParams} />;
      case "onboarded":
        return (
          <Placeholder text="Offer Letter Component Placeholder" />
        );
      default:
        return <Placeholder text="Coming soon..." />;
    }
  }, [currentStage, applicationData]);

  return (
    <div className="w-full">
      {/* === Stepper Navigation === */}
      <div className="overflow-x-auto scrollbar-thin">
        <nav
          className="flex justify-center items-center gap-4 px-4 py-4 flex-wrap"
          role="navigation"
          aria-label="Job Application Stage Navigation"
        >
          {STAGES.map((stage, index) => {
            const isActive = stage.key === currentStage;
            const isCompleted = index < currentIndex;
            const Icon = stage.icon;

            return (
              <Fragment key={stage.key}>
                <Tippy content={stage.label} placement="bottom">
                  <button
                    onClick={() => setStage(stage.key)}
                    className={cn(
                      "flex flex-col items-center group transition-colors focus:outline-none",
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : isCompleted
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-400 dark:text-gray-500"
                    )}
                    aria-current={isActive ? "step" : undefined}
                    aria-label={stage.label}
                  >
                    <motion.div
                      className={cn(
                        "w-10 h-10 rounded-full border-2 flex items-center justify-center",
                        isActive
                          ? "border-blue-600 bg-blue-100 dark:border-blue-400 dark:bg-blue-900/20"
                          : isCompleted
                          ? "border-green-600 bg-green-100 dark:border-green-400 dark:bg-green-900/20"
                          : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                      )}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </motion.div>
                    <span className="text-xs mt-1 group-hover:underline text-center w-24 truncate">
                      {stage.label}
                    </span>
                  </button>
                </Tippy>

                {index < STAGES.length - 1 && (
                  <div
                    className={cn(
                      "w-10 h-0.5 mx-2",
                      index < currentIndex
                        ? "bg-green-500 dark:bg-green-400"
                        : "bg-gray-300 dark:bg-gray-600"
                    )}
                    aria-hidden="true"
                  />
                )}
              </Fragment>
            );
          })}
        </nav>
      </div>

      {/* === Stage Content === */}
      <div className="p-6 sm:p-8 md:p-10 min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {renderStageComponent}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// === Placeholder Component ===
const Placeholder = ({ text }) => (
  <div className="text-center text-gray-500 dark:text-gray-400 text-lg font-medium">
    {text}
  </div>
);

export default StageWiseView;
