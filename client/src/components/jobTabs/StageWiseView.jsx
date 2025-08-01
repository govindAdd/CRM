import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Tippy from "@tippyjs/react";
import {
  CheckCircle,
  Circle,
  FilePlus,
  PhoneCall,
  Users,
  Video,
  BadgeCheck,
  UserCheck,
} from "lucide-react";
import CreateJob from "./CreateJob";

// === STAGES definition ===
const STAGES = [
  { key: "create", label: "Create", icon: FilePlus },
  { key: "telephone", label: "Telephone Interview", icon: PhoneCall },
  { key: "face_to_face", label: "Face-to-Face", icon: Users },
  { key: "virtual", label: "Virtual Interview", icon: Video },
  { key: "offered", label: "Offered", icon: BadgeCheck },
  { key: "onboarding", label: "Onboarding", icon: UserCheck },
];

// === Utility for conditional classes ===
const cn = (...classes) => classes.filter(Boolean).join(" ");

const StageWiseView = () => {
  const [params, setParams] = useSearchParams();
  const currentStage = params.get("stage") || STAGES[0].key;
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);

  const setStage = (stageKey) => setParams({ stage: stageKey });

  const renderStageComponent = () => {
    switch (currentStage) {
      case "create":
        return <CreateJob />;
      case "telephone":
        return <div className="text-center text-gray-500">Telephone Interview Stage</div>;
      default:
        return <div className="text-center text-gray-500">Coming soon...</div>;
    }
  };

  return (
    <div className="w-full">
      {/* === Stepper Header === */}
      <div className="overflow-x-auto scrollbar-thin">
        <nav
          className="flex flex-wrap justify-center items-center gap-4 px-4 sm:px-6 py-4"
          aria-label="Job Application Stage Navigation"
        >
          {STAGES.map((stage, index) => {
            const isActive = stage.key === currentStage;
            const isCompleted = index < currentIndex;
            const Icon = stage.icon;

            return (
              <div key={stage.key} className="flex items-center">
                <Tippy content={stage.label} placement="bottom">
                  <button
                    onClick={() => setStage(stage.key)}
                    className={cn(
                      "flex flex-col items-center group focus:outline-none transition-colors duration-150",
                      isActive
                        ? "text-blue-600"
                        : isCompleted
                        ? "text-green-600"
                        : "text-gray-400"
                    )}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <motion.div
                      className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center",
                        isActive
                          ? "border-blue-600 bg-blue-100"
                          : isCompleted
                          ? "border-green-600 bg-green-100"
                          : "border-gray-300 bg-white"
                      )}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </motion.div>
                    <span className="text-[10px] sm:text-xs mt-1 group-hover:underline text-center w-16 sm:w-24 truncate">
                      {stage.label}
                    </span>
                  </button>
                </Tippy>

                {/* === Connector === */}
                {index < STAGES.length - 1 && (
                  <div
                    className={cn(
                      "w-6 sm:w-10 h-0.5 mx-1 sm:mx-2",
                      index < currentIndex ? "bg-green-500" : "bg-gray-300"
                    )}
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* === Stage Content === */}
      <div className="p-4 sm:p-6 md:p-8 xl:p-10 2xl:p-12">
        {renderStageComponent()}
      </div>
    </div>
  );
};

export default StageWiseView;