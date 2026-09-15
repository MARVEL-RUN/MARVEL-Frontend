"use client";

import { createInquiry, getInquiry, updateInquiry } from "@/services/admin/inquiries";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SideBanner } from "../layout/SideBanner";
import { PasswordField } from "../register/ApplyUi";
import { isInquiryUnlocked, unlockInquiry } from "./order";

const ATTACH_ACCEPT =
  ".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,image/jpeg,image/png,application/pdf";
const ATTACH_MAX = 10;
const ATTACH_NAME_MAX = 80;
const ATTACH_NOTES = [
  "텍스트 에디터 내 이미지: JPG, PNG (크기 조절 가능)",
  "첨부파일: JPG, PNG, PDF, DOC, XLS, XLSX",
  "첨부파일 이름이 너무 길면 등록이 실패할 수 있습니다",
];

type AttachFile = {
  id: string;
  name: string;
  size: number;
};

function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function InquiryWritePage() {
  const router = useRouter();
  const editId = useSearchParams().get("id") ?? "";
  const editing = Boolean(editId);
  const fileRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(!editing);
  const [missing, setMissing] = useState(false);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<AttachFile[]>([]);

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
    void getInquiry(editId).then((row) => {
      if (!row) {
        setMissing(true);
        setReady(true);
        return;
      }
      if (row.answer) {
        router.replace(`/inquiry/view?id=${editId}`);
        return;
      }
      setName(row.name);
      setTitle(row.title);
      setBody(row.body);
      setFiles(row.attachments?.map((file) => ({ ...file })) ?? []);
      setAgree(true);
      setReady(true);
    });
  }, [editId, router]);

  const onPickFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (picked.length === 0) return;

    setFiles((prev) => {
      const next = [...prev];
      for (const file of picked) {
        if (next.length >= ATTACH_MAX) break;
        if (file.name.length > ATTACH_NAME_MAX) continue;
        next.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          size: file.size,
        });
      }
      return next;
    });
  };

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
          onSubmit={async (e) => {
            e.preventDefault();
            if (!name.trim() || !title.trim() || !body.trim()) {
              alert("작성자, 제목, 내용을 입력해 주세요.");
              return;
            }
            if (!editing) {
              if (password.trim().length < 4) {
                alert("비밀번호는 4자 이상 입력해 주세요.");
                return;
              }
              if (password !== passwordConfirm) {
                alert("비밀번호가 일치하지 않습니다.");
                return;
              }
            } else if (password.trim() || passwordConfirm.trim()) {
              if (password.trim().length < 4) {
                alert("비밀번호는 4자 이상 입력해 주세요.");
                return;
              }
              if (password !== passwordConfirm) {
                alert("비밀번호가 일치하지 않습니다.");
                return;
              }
            }
            if (!agree) {
              alert("개인정보 수집·이용에 동의해 주세요.");
              return;
            }
            setSaving(true);
            try {
              const attachments = files.map(({ id, name, size }) => ({
                id,
                name,
                size,
              }));
              const row = editing
                ? await updateInquiry(editId, {
                    name,
                    title,
                    body,
                    attachments,
                    password: password.trim() || undefined,
                  })
                : await createInquiry({
                    name,
                    title,
                    body,
                    password,
                    attachments,
                  });
              unlockInquiry(row.id);
              router.replace(`/inquiry/view?id=${row.id}`);
            } catch (error) {
              alert(
                error instanceof Error
                  ? error.message
                  : editing
                    ? "수정에 실패했습니다."
                    : "등록에 실패했습니다.",
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

          <div className="form-row">
            <span className="form-row__label">
              비밀번호 {editing ? null : <em>*</em>}
            </span>
            <div className="form-row__ctrl">
              <PasswordField
                value={password}
                onChange={setPassword}
                required={!editing}
                label="문의 비밀번호"
                placeholder={
                  editing
                    ? "변경할 때만 입력 (4자 이상)"
                    : "글 확인용 비밀번호 (4자 이상)"
                }
                autoComplete="new-password"
              />
            </div>
          </div>
          <div className="form-row">
            <span className="form-row__label">
              비밀번호 확인 {editing ? null : <em>*</em>}
            </span>
            <div className="form-row__ctrl">
              <PasswordField
                name="passwordConfirm"
                value={passwordConfirm}
                onChange={setPasswordConfirm}
                required={!editing}
                label="문의 비밀번호 확인"
                placeholder={
                  editing
                    ? "변경할 때만 다시 입력"
                    : "비밀번호를 다시 입력하세요."
                }
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="form-row is-top">
            <span className="form-row__label">첨부파일</span>
            <div className="form-row__ctrl board-attach">
              <div className="board-attach__head">
                <button
                  type="button"
                  className="btn btn--ghost board-attach__upload"
                  onClick={() => {
                    if (files.length >= ATTACH_MAX) return;
                    fileRef.current?.click();
                  }}
                >
                  첨부파일 업로드
                </button>
                <span>
                  {files.length}개 / {ATTACH_MAX}개
                </span>
              </div>
              <input
                ref={fileRef}
                type="file"
                className="board-attach__input"
                accept={ATTACH_ACCEPT}
                multiple
                onChange={onPickFiles}
              />
              <div className={`board-attach__box${files.length ? " has-files" : ""}`}>
                {files.length === 0 ? (
                  <p className="board-attach__empty">등록된 파일이 없습니다.</p>
                ) : (
                  <ul className="board-attach__list">
                    {files.map((file) => (
                      <li key={file.id}>
                        <span className="board-attach__name">{file.name}</span>
                        <span className="board-attach__size">{formatSize(file.size)}</span>
                        <button
                          type="button"
                          className="board-attach__remove"
                          aria-label={`${file.name} 삭제`}
                          onClick={() =>
                            setFiles((prev) => prev.filter((f) => f.id !== file.id))
                          }
                        >
                          삭제
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <ul className="board-attach__notes">
                {ATTACH_NOTES.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </div>

          <label className="board-write__agree">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <span>
              문의 접수 및 답변을 위해 작성자·문의내용을 수집·이용하는 데
              동의합니다.
            </span>
          </label>

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
    </main>
  );
}
