import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getDueCards, saveSrsCard, deleteSrsCard, getSrsCards } from "@/lib/storage";
import { reviewCard, SrsRating } from "@/lib/srs";
import { SrsCard } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Trash2, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";

const SrsPage: React.FC = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<SrsCard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [editTranslation, setEditTranslation] = useState("");

  useEffect(() => {
    setCards(getDueCards());
  }, []);

  const currentCard = cards[currentIdx];

  const handleRate = useCallback(
    (rating: SrsRating) => {
      if (!currentCard) return;
      const updated = reviewCard(currentCard, rating);
      saveSrsCard(updated);
      setFlipped(false);
      if (currentIdx < cards.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        toast.success("오늘 복습 완료! 🎉");
        setCards([]);
      }
    },
    [currentCard, currentIdx, cards.length]
  );

  const handleDelete = () => {
    if (!currentCard) return;
    deleteSrsCard(currentCard.id);
    const next = cards.filter((c) => c.id !== currentCard.id);
    setCards(next);
    if (currentIdx >= next.length) setCurrentIdx(Math.max(0, next.length - 1));
    setFlipped(false);
    toast.success("카드 삭제됨");
  };

  const handleSaveEdit = () => {
    if (!currentCard) return;
    const updated = { ...currentCard, text: editText, translation: editTranslation };
    saveSrsCard(updated);
    const next = [...cards];
    next[currentIdx] = updated;
    setCards(next);
    setEditing(false);
    toast.success("카드 수정됨");
  };

  const totalCards = getSrsCards().length;

  if (cards.length === 0) {
    return (
      <>
        <PageShell title="SRS 복습">
          <div className="text-center py-16">
            <div className="text-5xl mb-4">✅</div>
            <p className="font-medium mb-1">오늘 복습할 카드가 없어요</p>
            <p className="text-sm text-muted-foreground mb-2">총 {totalCards}개 카드 관리 중</p>
            <Button variant="outline" onClick={() => navigate("/home")}>
              홈으로
            </Button>
          </div>
        </PageShell>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <PageShell title={`복습 ${currentIdx + 1}/${cards.length}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id + (flipped ? "-back" : "-front")}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {editing ? (
              <div className="bg-card rounded-2xl border p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">문장</label>
                  <Input value={editText} onChange={(e) => setEditText(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">번역</label>
                  <Input value={editTranslation} onChange={(e) => setEditTranslation(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setEditing(false)}>취소</Button>
                  <Button className="flex-1 gradient-primary text-primary-foreground" onClick={handleSaveEdit}>저장</Button>
                </div>
              </div>
            ) : (
              <button
                className="w-full bg-card rounded-2xl border p-8 min-h-[200px] flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setFlipped(!flipped)}
              >
                {!flipped ? (
                  <>
                    <p className="text-xs text-muted-foreground mb-4">탭하여 뒤집기</p>
                    <p className="text-lg font-medium">
                      {currentCard.text.split(" ").map((w, i) =>
                        i % 3 === 1 ? <span key={i} className="bg-primary/20 rounded px-1">____</span> : <span key={i}> {w} </span>
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium mb-3">{currentCard.text}</p>
                    {currentCard.translation && (
                      <p className="text-sm text-muted-foreground">{currentCard.translation}</p>
                    )}
                  </>
                )}
              </button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => {
              setEditText(currentCard.text);
              setEditTranslation(currentCard.translation || "");
              setEditing(true);
            }}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={handleDelete} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Rating Buttons */}
        {flipped && !editing && (
          <div className="grid grid-cols-3 gap-3 mt-6">
            <Button
              variant="outline"
              className="h-14 flex-col border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => handleRate("hard")}
            >
              <span className="text-lg">😓</span>
              <span className="text-xs">어려움</span>
            </Button>
            <Button
              variant="outline"
              className="h-14 flex-col border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => handleRate("good")}
            >
              <span className="text-lg">🙂</span>
              <span className="text-xs">보통</span>
            </Button>
            <Button
              variant="outline"
              className="h-14 flex-col border-success/30 text-success hover:bg-success/10"
              onClick={() => handleRate("easy")}
            >
              <span className="text-lg">😎</span>
              <span className="text-xs">쉬움</span>
            </Button>
          </div>
        )}
      </PageShell>
      <BottomNav />
    </>
  );
};

export default SrsPage;
