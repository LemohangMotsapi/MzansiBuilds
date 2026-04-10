import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Rocket } from "lucide-react";
import api from "../api";
import { toast } from "sonner";

const statusOptions = ["Researching", "In Progress", "Shipped"];

const ProjectModal = ({ isOpen, onClose, refreshProjects }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tech_stack, setTechStack] = useState("");
  const [status, setStatus] = useState("Researching");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/projects", { title, description, tech_stack, status });
      toast.success("Project shipped to the feed! 🚀");
      setTitle("");
      setDescription("");
      setTechStack("");
      setStatus("Researching");
      if (refreshProjects) refreshProjects();
      onClose();
    } catch {
      toast.error("Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg glass neon-border rounded-xl p-6 z-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                Ship New Work
              </h2>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Project Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. MzansiBuilds Platform"
                  className="w-full px-3 py-2.5 rounded-md bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What are you building and why?"
                  className="w-full px-3 py-2.5 rounded-md bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Tech Stack
                </label>
                <input
                  value={tech_stack}
                  onChange={(e) => setTechStack(e.target.value)}
                  placeholder="React, Node.js, Supabase"
                  className="w-full px-3 py-2.5 rounded-md bg-secondary border border-border text-foreground text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                />
                <p className="text-xs text-muted-foreground mt-1">Comma-separated</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Status
                </label>
                <div className="flex gap-2">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setStatus(opt)}
                      className={`flex-1 px-3 py-2 rounded-md text-xs font-mono border transition-all ${
                        status === opt
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Shipping..." : "Ship It 🚀"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectModal;