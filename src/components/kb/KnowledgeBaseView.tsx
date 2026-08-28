import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Eye,
  Tag,
  CheckCircle2,
  FileText,
  X,
  Sparkles,
} from 'lucide-react';
import { KnowledgeArticle, User as UserType } from '../../types/itsm';

interface KnowledgeBaseViewProps {
  articles: KnowledgeArticle[];
  currentUser: UserType;
  onCreateArticle: (data: any) => Promise<void>;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  articles,
  currentUser,
  onCreateArticle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Troubleshooting');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredArticles = (articles || []).filter((a) => {
    if (selectedCategory !== 'ALL' && a.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        (a.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const categories = ['ALL', 'Troubleshooting', 'SOP & Guidelines', 'Security', 'Database', 'Network'];

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onCreateArticle({
        title,
        category,
        content,
        tags,
      });

      setShowCreateModal(false);
      setTitle('');
      setContent('');
      setTagsInput('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0B2545] to-[#133E6D] text-white p-6 rounded-2xl border border-[#1C5494] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>ITSM Knowledge Repository</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Standard Operating Procedures (SOP) & Troubleshooting KB
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Enterprise knowledge base containing approved technical SOPs, runbooks, and resolution guides.
            Resolved incidents can be converted into published articles in 1 click.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Publish KB Article</span>
        </button>
      </div>

      {/* Search & Category Pills */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
        <div className="relative">
          <input
            type="text"
            placeholder="Search KB articles by keyword, error code, command, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-600 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-700 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredArticles.map((art) => (
          <div
            key={art.id}
            onClick={() => setSelectedArticle(art)}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  {art.category}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Eye className="w-3.5 h-3.5" /> {art.views} views
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                {art.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-3 mt-2 leading-relaxed">
                {art.content}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap gap-1 mb-2">
                {(art.tags || []).slice(0, 3).map((tg, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                    #{tg}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span>By {art.authorName}</span>
                <span className="text-blue-600 font-semibold group-hover:underline">Read Article &rarr;</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] text-xs animate-in zoom-in-95">
            <div className="bg-[#0B2545] text-white p-5 flex items-start justify-between border-b border-[#1C5494]">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-400/30">
                    {selectedArticle.category}
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Author: <strong>{selectedArticle.authorName}</strong> • {new Date(selectedArticle.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1.5 tracking-tight">{selectedArticle.title}</h2>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4">
              <div className="prose prose-sm max-w-none text-slate-800 text-xs leading-relaxed whitespace-pre-wrap font-sans bg-slate-50 p-4 rounded-xl border border-slate-200">
                {selectedArticle.content}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <div className="flex gap-1.5">
                    {(selectedArticle.tags || []).map((tg, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-mono">
                        {tg}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-1.5 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800"
                >
                  Close Article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Article Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs animate-in zoom-in-95">
            <div className="bg-[#0B2545] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Publish Knowledge Base Article</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Article Title / Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SOP: SSL Certificate Renewal Procedure on Nginx Load Balancers"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="Troubleshooting">Troubleshooting</option>
                    <option value="SOP & Guidelines">SOP & Guidelines</option>
                    <option value="Security">Security</option>
                    <option value="Database">Database</option>
                    <option value="Network">Network</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="ssl, certbot, nginx, ndc"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Article Content & Step-by-Step Instructions</label>
                <textarea
                  required
                  rows={8}
                  placeholder="Detail symptoms, commands, root cause, and standard steps..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg outline-none font-mono text-xs focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
