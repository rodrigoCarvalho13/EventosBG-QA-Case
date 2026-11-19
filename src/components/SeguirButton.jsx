import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Bell, BellRing, Loader2 } from "lucide-react";
import { setFollowTag, removeFollowTag } from "@/lib/onesignal";

export default function SeguirButton({ lojaId }) {
  const { user } = useAuth();
  const location = useLocation();
  const [following, setFollowing] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [myPage, total] = await Promise.all([
          base44.entities.Seguindo.filter(
            { loja_id: lojaId, created_by_id: user.id },
            { limit: 1 }
          ),
          base44.entities.Seguindo.count({ loja_id: lojaId }),
        ]);
        if (!cancelled) {
          setFollowing((myPage.items || []).length > 0);
          setCount(total);
        }
      } catch (e) {
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lojaId, user]);

  const toggle = async () => {
    if (!user || toggling) return;
    setToggling(true);
    try {
      if (following) {
        const myPage = await base44.entities.Seguindo.filter(
          { loja_id: lojaId, created_by_id: user.id },
          { limit: 1 }
        );
        for (const f of myPage.items || []) {
          await base44.entities.Seguindo.delete(f.id);
        }
        setFollowing(false);
        setCount((c) => Math.max(0, c - 1));
        removeFollowTag(lojaId);
      } else {
        await base44.entities.Seguindo.create({ loja_id: lojaId });
        setFollowing(true);
        setCount((c) => c + 1);
        setFollowTag(lojaId);
      }
    } catch (e) {
    } finally {
      setToggling(false);
    }
  };

  if (!user) {
    return (
      <Button asChild variant="outline">
        <Link to={`/login?returnTo=${encodeURIComponent(location.pathname)}`}>
          <Bell className="w-4 h-4 mr-1.5" aria-hidden="true" /> Seguir
        </Link>
      </Button>
    );
  }

  return (
    <Button
      onClick={toggle}
      disabled={toggling || loading}
      variant={following ? "secondary" : "default"}
      aria-pressed={following}
    >
      {toggling ? (
        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" aria-hidden="true" />
      ) : following ? (
        <BellRing className="w-4 h-4 mr-1.5" aria-hidden="true" />
      ) : (
        <Bell className="w-4 h-4 mr-1.5" aria-hidden="true" />
      )}
      {following ? "Seguindo" : "Seguir"}
      {count > 0 && (
        <span className="ml-1.5 text-xs opacity-70" aria-hidden="true">
          {count}
        </span>
      )}
    </Button>
  );
}