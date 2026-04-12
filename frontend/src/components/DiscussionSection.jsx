import React, { useState, useRef } from "react";
import { Send, CornerDownRight, X, MessageSquare } from "lucide-react";
import api from "../api";
import { toast } from "sonner";

const DiscussionSection = ({ projectId, discussions, onRefresh, user }) => {
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedThreads, setExpandedThreads] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  const toggleThread = (parentId) => {
    setExpandedThreads((prev) =>
      prev.includes(parentId)
        ? prev.filter((id) => id !== parentId)
        : [...prev, parentId]
    );
  };

  const handleReplyClick = (post, actualParentId = null) => {
    const threadId = actualParentId || post.id;
    setReplyingTo({ id: threadId, username: post.users.username });
    
    if (actualParentId && !expandedThreads.includes(actualParentId)) {
      setExpandedThreads([...expandedThreads, actualParentId]);
    }

    inputRef.current?.focus();
    setContent(`@${post.users.username} `);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post(`/projects/${projectId}/discussions`, {
        content: content.trim(),
        parent_id: replyingTo?.id || null,
        type: "COMMENT",
      });

      setContent("");
      setReplyingTo(null);
      onRefresh();
      toast.success("Response synchronized");
    } catch (error) {
      toast.error("Failed to post message");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to highlight mentions in the text
  const formatContent = (text) => {
    return text.split(" ").map((word, i) => {
      if (word.startsWith("@")) {
        return <span key={i} className="text-primary font-bold mr-1">{word}</span>;
      }
      return <span key={i}>{word} </span>;
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. INPUT AREA */}
      {user ? (
        <form onSubmit={handleSubmit} className="relative group">
          {replyingTo && (
            <div className="flex justify-between items-center bg-primary/10 px-3 py-1.5 rounded-t-lg border-x border-t border-primary/20 text-[10px] font-mono text-primary animate-in slide-in-from-bottom-2">
              <span className="flex items-center gap-1">
                <CornerDownRight className="w-3 h-3" />
                REPLYING_TO: @{replyingTo.username}
              </span>
              <button type="button" onClick={() => { setReplyingTo(null); setContent(""); }}>
                <X className="w-3 h-3 hover:scale-125 transition-transform" />
              </button>
            </div>
          )}
          <div className="relative">
            <textarea
              ref={inputRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Join the discussion..."
              className={`w-full bg-secondary/30 border border-border p-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary h-28 resize-none transition-all ${replyingTo ? 'rounded-b-lg' : 'rounded-lg'}`}
            />
            <button
              disabled={isSubmitting || !content.trim()}
              className="absolute bottom-4 right-4 p-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-30 transition-all shadow-lg"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="p-8 border border-dashed border-border rounded-xl text-center text-muted-foreground font-mono text-xs">
          AUTH REQUIRED FOR COLLABORATION
        </div>
      )}

      {/* 2. THREADED FEED */}
      <div className="space-y-8">
        {discussions.filter(d => !d.parent_id).length > 0 ? (
          discussions.filter(d => !d.parent_id).map((parent) => {
            const replies = discussions.filter(d => d.parent_id === parent.id);
            const isExpanded = expandedThreads.includes(parent.id);

            return (
              <div key={parent.id} className="space-y-4">
                {/* Main Post Card */}
                <div className="p-5 rounded-xl border border-border bg-card/40 group transition-all hover:bg-card/60">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {parent.users?.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-foreground">@{parent.users?.username}</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">{new Date(parent.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{parent.content}</p>
                  <button
                    onClick={() => handleReplyClick(parent)}
                    className="text-[10px] font-mono text-primary flex items-center gap-1 hover:underline"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Reply
                  </button>
                </div>

                {/* Replies with Vertical Connector Line */}
                {replies.length > 0 && (
                  <div className="ml-10 space-y-4">
                    {!isExpanded ? (
                      <button
                        onClick={() => toggleThread(parent.id)}
                        className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors group"
                      >
                        <div className="w-10 h-[1px] bg-border group-hover:bg-primary transition-colors" />
                        View {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                      </button>
                    ) : (
                      <>
                        <div className="space-y-6 border-l border-border/40 pl-8 my-4 relative animate-in fade-in slide-in-from-left-2 duration-300">
                          {replies.map((reply) => {
                            // Extract the mentioned user if it exists
                            const mentionedUser = reply.content.startsWith("@") ? reply.content.split(" ")[0] : null;

                            return (
                              <div key={reply.id} className="relative group">
                                <div className="absolute -left-8 top-3 w-6 h-[1px] bg-border/40" />
                                
                                <div className="flex justify-between items-start mb-1">
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-bold text-foreground">@{reply.users?.username}</span>
                                      
                                      {/* THE FIX: Small badge showing the specific context of the reply */}
                                      {mentionedUser && (
                                        <div className="flex items-center gap-1 px-1 py-0.5 rounded-full bg-secondary/50 border border-border/50">
                                          <CornerDownRight className="w-2 h-2 text-muted-foreground" />
                                          <span className="text-[8px] text-muted-foreground font-medium uppercase tracking-tighter">
                                            Reply to {mentionedUser}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-[9px] font-mono text-muted-foreground">{new Date(reply.created_at).toLocaleDateString()}</span>
                                </div>
                                
                                <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                                  {formatContent(reply.content)}
                                </p>
                                
                                <button
                                  onClick={() => handleReplyClick(reply, parent.id)}
                                  className="text-[9px] font-mono text-muted-foreground hover:text-primary transition-colors"
                                >
                                  Reply
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => toggleThread(parent.id)}
                          className="text-[10px] font-mono text-muted-foreground hover:text-primary ml-8"
                        >
                          Hide replies
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center border border-dashed border-border rounded-2xl">
            <p className="text-sm text-muted-foreground font-mono italic">NO DISCUSSIONS LOGGED YET</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionSection;