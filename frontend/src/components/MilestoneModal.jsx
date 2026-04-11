import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Loader2 } from "lucide-react";
import api from "../api";
import { toast } from "sonner";

const MilestoneModal = ({ isOpen, onClose, projectId, onRefresh }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Feature Added",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Sends data to  Express route: app.use('/api/projects/:projectId/milestones', milestoneRoutes)
      await api.post(`/projects/${projectId}/milestones`, formData);
      toast.success("Milestone synchronized with engineering log");
      if (onRefresh) onRefresh();
      setFormData({ title: "", description: "", status: "Feature Added" });
      onClose();
    } catch (error) {
      console.error("Sync Error:", error);
      toast.error(error.response?.data?.error || "Failed to log milestone");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/30">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary fill-primary/20" />
              Log Milestone
            </h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5">
                Milestone Title
              </label>
              <input
                required
                className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                placeholder="e.g., Integrated Supabase Auth"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5">
                Description
              </label>
              <textarea
                className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                placeholder="Briefly explain the technical achievement..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5">
                Update Status
              </label>
              <select
                className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Feature Added">🚀 Feature Added</option>
                <option value="Bug Fixed">🐛 Bug Fixed</option>
                <option value="UI Refined">🎨 UI Refined</option>
                <option value="Major Update">⭐ Major Update</option>
              </select>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-3 rounded-md bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  SYNCING_LOG...
                </>
              ) : (
                "COMMIT_TO_TIMELINE"
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MilestoneModal;