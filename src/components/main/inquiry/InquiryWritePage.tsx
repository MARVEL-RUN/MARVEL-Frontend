"use client";

import { DEFAULT_EVENT_ID } from "@/lib/main/config";
import {
  createPublicQuestion,
  getPublicQuestionDetail,
  updatePublicQuestion,
} from "@/services/main/questions";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { mainToast, useMainAlert } from "../feedback/MainFeedback";
import { SideBanner } from "../layout/SideBanner";
import { PasswordField } from "../register/ApplyUi";
import {
  getInquiryPassword,
  isInquiryUnlocked,
  unlockInquiry,
} from "./order";

function pickCreatedId(res: unknown): string | null {
  if (typeof res === "string" && res.trim()) return res.trim();
  if (res && typeof res === "object") {
    const row = res as Record<string, unknown>;
    if (typeof row.id === "string" && row.id) return row.id;
    if (typeof row.questionId === "string" && row.questionId) return row.questionId;
  }
  return null;
}

export function InquiryWritePage() {
  const router = useRouter();
  const editId = useSearchParams().get("id") ?? "";
  const editing = Boolean(editId);
  const { alert: showAlert, modal: alertModal } = useMainAlert();
  const [ready, setReady] = useState(!editing);
  const [missing, setMissing] = useState(false);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [secret, setSecret] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [editId, ready]);

  useEffect(() => {
    if (!editId) {
      setReady(true);
      setMissing(false);
      return;
    }
    if (!isInquiryUnlocked(editId)) {
      router.replace(`/inquiry/view?id=${editId}`);
      return;
    }
    const savedPassword = getInquiryPassword(editId);
    void getPublicQuestionDetail(editId, savedPassword)
      .then((detail) => {
        const q = detail.questionDetail;
        if (detail.answerDetail?.content) {
          router.replace(`/inquiry/view?id=${editId}`);
          return;
        }
        setName(q.author);
        setTitle(q.title);
        setBody(q.content);
        setSecret(q.secret);
        setPassword(savedPassword);
        setReady(true);
      })
      .catch(() => {
        setMissing(true);
        setReady(true);
      });
  }, [editId, router]);

  const cancelHref = editing ? `/inquiry/view?id=${editId}` : "/inquiry";

  if (!ready) {
    return (
      <main className="page">
        <SideBanner kicker="INQUIRY" title="문의사항" en="CONTACT" />
        <div className="page__body wrap">
          <p className="board__empty">불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (missing) {
    return (
      <main className="page">
        <SideBanner kicker="INQUIRY" title="문의사항" en="CONTACT" />
        <div className="page__body wrap">
          <p className="board__empty">글을 찾을 수 없습니다.</p>
          <div className="post__foot">
            <Link href="/inquiry" className="btn btn--ghost">
              목록
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <SideBanner kicker="INQUIRY" title="문의사항" en="CONTACT" />
      <div className="page__body wrap">
        <form
          className="board-write"
          noValidate
          onSubmit={async (e) => {
            e.preventDefault();
            if (!name.trim() || !title.trim() || !body.trim()) {
              showAlert("작성자, 제목, 내용을 입력해 주세요.", "입력 확인");
              return;
            }
            if (!editing) {
              if (password.trim().length < 4) {
                showAlert("비밀번호는 4자 이상 입력해 주세요.", "입력 확인");
                return;
              }
              if (password !== passwordConfirm) {
                showAlert("비밀번호가 일치하지 않습니다.", "입력 확인");
                return;
              }
            }
            setSaving(true);
            try {
              if (editing) {
                const savedPassword = getInquiryPassword(editId) || password;
                if (!savedPassword) {
                  showAlert(
                    "비밀번호 확인 후 다시 시도해 주세요.",
                    "수정 실패",
                  );
                  return;
                }
                await updatePublicQuestion(editId, {
                  patch: {
                    title: title.trim(),
                    content: body.trim(),
                    secret,
                  },
                  password: savedPassword,
                });
                unlockInquiry(editId, savedPassword);
                mainToast.success("문의가 수정되었습니다.");
                router.replace(`/inquiry/view?id=${editId}`);
                return;
              }

              const created = await createPublicQuestion(DEFAULT_EVENT_ID, {
                post: {
                  title: title.trim(),
                  content: body.trim(),
                  secret: true,
                },
                nickName: name.trim(),
                password: password.trim(),
              });
              const id = pickCreatedId(created);
              if (id) unlockInquiry(id, password.trim());
              mainToast.success("문의가 등록되었습니다.");
              router.replace("/inquiry");
            } catch (error) {
              showAlert(
                error instanceof Error
                  ? error.message
                  : editing
                    ? "수정에 실패했습니다."
                    : "등록에 실패했습니다.",
                editing ? "수정 실패" : "등록 실패",
              );
            } finally {
              setSaving(false);
            }
          }}
        >
          <div className="board-write__head">
            <h2>{editing ? "글수정" : "글쓰기"}</h2>
            <Link href="/inquiry" className="btn btn--ghost">
              목록
            </Link>
          </div>

          <div className="form-row">
            <span className="form-row__label">
              작성자 <em>*</em>
            </span>
            <div className="form-row__ctrl">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                disabled={editing}
              />
            </div>
          </div>
          <div className="form-row">
            <span className="form-row__label">
              제목 <em>*</em>
            </span>
            <div className="form-row__ctrl">
              <input
                type="text"
                className="is-wide"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>
          <div className="form-row is-top">
            <span className="form-row__label">
              내용 <em>*</em>
            </span>
            <div className="form-row__ctrl">
              <textarea
                rows={14}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
          </div>

          {editing ? (
            <div className="form-row">
              <span className="form-row__label">비밀번호</span>
              <div className="form-row__ctrl">
                <PasswordField
                  value={password}
                  onChange={() => {}}
                  label="문의 비밀번호"
                  placeholder="••••••••"
                  autoComplete="off"
                  minLength={0}
                  disabled
                />
                <p className="board-write__hint">비밀번호는 수정할 수 없습니다.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="form-row">
                <span className="form-row__label">
                  비밀번호 <em>*</em>
                </span>
                <div className="form-row__ctrl">
                  <PasswordField
                    value={password}
                    onChange={setPassword}
                    label="문의 비밀번호"
                    placeholder="글 확인용 비밀번호 (4자 이상)"
                    autoComplete="new-password"
                    minLength={0}
                  />
                </div>
              </div>
              <div className="form-row">
                <span className="form-row__label">
                  비밀번호 확인 <em>*</em>
                </span>
                <div className="form-row__ctrl">
                  <PasswordField
                    name="passwordConfirm"
                    value={passwordConfirm}
                    onChange={setPasswordConfirm}
                    label="문의 비밀번호 확인"
                    placeholder="비밀번호를 다시 입력하세요."
                    autoComplete="new-password"
                    minLength={0}
                  />
                </div>
              </div>
            </>
          )}

          <div className="board-write__actions">
            <Link href="/inquiry" className="btn btn--ghost">
              목록
            </Link>
            <div className="board-write__actions-end">
              <Link href={cancelHref} className="btn btn--ghost">
                취소
              </Link>
              <button type="submit" className="btn btn--red" disabled={saving}>
                {saving
                  ? editing
                    ? "수정 중..."
                    : "등록 중..."
                  : editing
                    ? "수정"
                    : "등록"}
              </button>
            </div>
          </div>
        </form>
      </div>
      {alertModal}
    </main>
  );
}
