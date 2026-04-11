import React, { useState, useEffect } from "react";
import { X, Save, Rocket, Cpu, HelpCircle } from "lucide-react";
import api from "../api";
import { toast } from "sonner";

const EditProjectModal = ({ project, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "In Progress",
    tech_stack: "",
    support_required: "" // Added field
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || "",
        description: project.description || "",
        status: project.status || "In Progress",
        tech_stack: project.tech_stack || "",
        support_required: project.support_required || "" // Sync from DB
      });
    }
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${project.id}`, formData);
      
      if (formData.status === "Shipped") {
        toast.success("PROJECT_SHIPPED: Added to Celebration Wall! 🚀", { duration: 5000 });
      } else {
        toast.success("Project logs updated successfully.");
      }
      
      onUpdate();
      onClose();
    } catch (error) {
      toast.error("SYSTEM_ERROR: Update failed");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/10">
          <h2 className="text-xl font-bold font-mono flex items-center gap-2 text-primary">
            <Cpu className="w-5 h-5" /> OVERRIDE_PROJECT_DATA
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-muted-foreground">Title</label>
            <input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-secondary/30 border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-muted-foreground">Execution Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full bg-secondary/30 border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none appearance-none"
              >
                <option value="Researching">Researching</option>
                <option value="In Progress">In Progress</option>
                <option value="Shipped">Shipped</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-muted-foreground text-primary flex items-center gap-1">
                <HelpCircle className="w-3 h-3" /> Support Needed
              </label>
              <input
                value={formData.support_required}
                onChange={(e) => setFormData({...formData, support_required: e.target.value})}
                placeholder="e.g. Need CSS help"
                className="w-full bg-secondary/30 border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-muted-foreground">Tech Stack (comma separated)</label>
            <input
              value={formData.tech_stack}
              onChange={(e) => setFormData({...formData, tech_stack: e.target.value})}
              className="w-full bg-secondary/30 border border-border rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-muted-foreground">Project Intelligence (Description)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-secondary/30 border border-border rounded-lg p-3 text-sm h-28 resize-none focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-[0_0_20px_-5px_rgba(34,197,94,0.4)]"
          >
            {formData.status === "Shipped" ? <Rocket className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {formData.status === "Shipped" ? "DECODE_AND_SHIP" : "UPDATE_SYSTEM_LOGS"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;