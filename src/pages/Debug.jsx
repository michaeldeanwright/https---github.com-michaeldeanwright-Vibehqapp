import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, firebaseAuth } from "@/lib/firebase";
import { base44 } from "@/api/base44Client";

// Temporary diagnostics page (open /debug while signed in). Delete when done.
async function attempt(fn) {
  try {
    return { ok: true, value: await fn() };
  } catch (err) {
    return { ok: false, error: `${err.code || "error"}: ${err.message}` };
  }
}

const rawDocs = async (name) => {
  const snap = await getDocs(collection(db, name));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

function Row({ label, children }) {
  return (
    <div className="flex gap-3 py-1.5 text-sm border-b border-border/50">
      <span className="w-40 shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 break-all">{children}</span>
    </div>
  );
}

export default function Debug() {
  const [report, setReport] = useState(null);
  const user = firebaseAuth.currentUser;

  const run = async () => {
    setReport(null);
    const [rawPosts, listPosts, rawProfiles, listProfiles] = await Promise.all([
      attempt(() => rawDocs("posts")),
      attempt(() => base44.entities.Post.list("-created_date", 100)),
      attempt(() => rawDocs("profiles")),
      attempt(() => base44.entities.Profile.list("-created_date", 200)),
    ]);
    setReport({ rawPosts, listPosts, rawProfiles, listProfiles });
  };

  useEffect(() => { run(); }, []);

  const count = (r) => (r.ok ? r.value.length : `FAILED - ${r.error}`);

  return (
    <div className="space-y-4 py-4">
      <h2 className="font-display text-2xl">Diagnostics</h2>

      <div className="bg-card rounded-2xl p-4 border border-border/60">
        <Row label="Signed in as">{user?.email || "nobody"}</Row>
        <Row label="Your user ID (UID)">{user?.uid || "-"}</Row>
        <Row label="Firebase project">{db.app.options.projectId}</Row>
      </div>

      {!report && <p className="text-sm text-muted-foreground">Running checks...</p>}

      {report && (
        <>
          <div className="bg-card rounded-2xl p-4 border border-border/60">
            <Row label="posts (all docs)">{count(report.rawPosts)}</Row>
            <Row label="posts (app query)">{count(report.listPosts)}</Row>
            <Row label="profiles (all docs)">{count(report.rawProfiles)}</Row>
            <Row label="profiles (app query)">{count(report.listProfiles)}</Row>
          </div>

          {report.rawPosts.ok && report.listPosts.ok && report.rawPosts.value.length > report.listPosts.value.length && (
            <p className="text-sm text-destructive">
              Some posts exist but the feed query skips them - they are missing a created_date field.
            </p>
          )}
          {report.rawProfiles.ok && report.listProfiles.ok && report.rawProfiles.value.length > report.listProfiles.value.length && (
            <p className="text-sm text-destructive">
              Some profiles exist but the app query skips them - they are missing a created_date field.
            </p>
          )}

          {report.rawPosts.ok && (
            <div className="bg-card rounded-2xl p-4 border border-border/60 space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Posts</p>
              {report.rawPosts.value.length === 0 && <p className="text-sm">None found.</p>}
              {report.rawPosts.value.slice(0, 10).map((p) => (
                <div key={p.id} className="text-xs border-t border-border/50 pt-2">
                  <div>“{(p.content || "").slice(0, 60)}”</div>
                  <div className="text-muted-foreground">
                    created_date: {p.created_date || "MISSING"} · created_by_id:{" "}
                    {p.created_by_id ? (p.created_by_id === user?.uid ? "yours ✓" : "someone else") : "MISSING"}
                  </div>
                </div>
              ))}
            </div>
          )}

          {report.rawProfiles.ok && (
            <div className="bg-card rounded-2xl p-4 border border-border/60 space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Profiles</p>
              {report.rawProfiles.value.length === 0 && <p className="text-sm">None found.</p>}
              {report.rawProfiles.value.slice(0, 20).map((p) => (
                <div key={p.id} className="text-xs border-t border-border/50 pt-2">
                  <div>{p.full_name || "(no name)"} · {p.email || "(no email)"}</div>
                  <div className="text-muted-foreground">
                    user_id: {p.user_id || "MISSING"}{p.user_id === user?.uid ? " (you)" : ""}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={run} className="text-sm border rounded-full px-4 py-2">Run again</button>
        </>
      )}
    </div>
  );
}
