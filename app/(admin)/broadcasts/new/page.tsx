"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createBroadcast,
  getBroadcastRecipients,
  uploadImage,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChevronLeft,
  ImagePlus,
  X,
  Loader2,
  Eye,
  Code,
  Search,
  Users,
  RefreshCw,
} from "lucide-react";

type Tab = "editor" | "preview";

export default function NewBroadcastPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("editor");

  // Image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recipients
  const [hasTelegram, setHasTelegram] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [recipientsLoaded, setRecipientsLoaded] = useState(false);

  // State
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadRecipients = useCallback(async () => {
    setRecipientsLoading(true);
    setError("");
    try {
      const ids = await getBroadcastRecipients({
        hasTelegram,
        search: searchQuery || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      setRecipients(ids);
      setRecipientsLoaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRecipientsLoading(false);
    }
  }, [hasTelegram, searchQuery, fromDate, toDate]);

  // Load recipients on mount
  useEffect(() => {
    loadRecipients();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const insertTag = (tag: string, attr?: string) => {
    const textarea = document.getElementById("msg-editor") as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = message.slice(start, end);
    const open = attr ? `<${tag} ${attr}>` : `<${tag}>`;
    const close = `</${tag}>`;
    const replacement = `${open}${selected}${close}`;
    const newMsg = message.slice(0, start) + replacement + message.slice(end);
    setMessage(newMsg);
    // Restore cursor position after the inserted text
    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPos = start + open.length + selected.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const handleCreate = async () => {
    if (!message.trim() || recipients.length === 0) return;
    setCreating(true);
    setError("");
    try {
      let imageId: string | null = null;
      if (imageFile) {
        const img = await uploadImage(imageFile);
        imageId = img.id;
      }
      const broadcast = await createBroadcast({
        message: message.trim(),
        userIds: recipients,
        parseMode: "HTML",
        imageId,
      });
      router.push(`/broadcasts/${broadcast.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/broadcasts")}
        >
          <ChevronLeft className="mr-1 size-4" />
          Рассылки
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Новая рассылка
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Составьте сообщение и выберите получателей. После создания рассылку
          можно будет отправить.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left column: message editor */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Сообщение</CardTitle>
                <div className="flex rounded-lg border p-0.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("editor")}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-sm transition-colors ${
                      activeTab === "editor"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Code className="size-3.5" />
                    HTML
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-sm transition-colors ${
                      activeTab === "preview"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Eye className="size-3.5" />
                    Превью
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === "editor" ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    <TagButton label="B" onClick={() => insertTag("b")} title="Жирный" />
                    <TagButton label="I" onClick={() => insertTag("i")} title="Курсив" className="italic" />
                    <TagButton label="U" onClick={() => insertTag("u")} title="Подчёркнутый" className="underline" />
                    <TagButton label="S" onClick={() => insertTag("s")} title="Зачёркнутый" className="line-through" />
                    <TagButton label="Code" onClick={() => insertTag("code")} title="Код" className="font-mono text-xs" />
                    <TagButton label="Pre" onClick={() => insertTag("pre")} title="Блок кода" className="font-mono text-xs" />
                    <TagButton
                      label="Link"
                      onClick={() => {
                        const url = prompt("URL:");
                        if (url) insertTag("a", `href="${url}"`);
                      }}
                      title="Ссылка"
                    />
                  </div>
                  <textarea
                    id="msg-editor"
                    className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                    placeholder="Текст сообщения в формате HTML..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Поддерживаемые теги Telegram: &lt;b&gt;, &lt;i&gt;, &lt;u&gt;, &lt;s&gt;, &lt;code&gt;, &lt;pre&gt;, &lt;a href=&quot;...&quot;&gt;
                  </p>
                </div>
              ) : (
                <div className="min-h-[300px] rounded-md border bg-muted/20 p-4">
                  {message.trim() ? (
                    <div
                      className="prose prose-sm max-w-none text-sm break-words [&_a]:text-blue-600 [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: message }}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Введите сообщение для предпросмотра
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>Изображение</CardTitle>
            </CardHeader>
            <CardContent>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-48 rounded-lg border object-contain"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 rounded-full bg-background border shadow-sm p-1 hover:bg-muted"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="mr-2 size-4" />
                  Прикрепить изображение
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column: recipients */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-4" />
                  Получатели
                </CardTitle>
                {recipientsLoaded && (
                  <span className="text-2xl font-semibold tabular-nums">
                    {recipients.length}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Поиск
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Email, имя, telegram ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasTelegram}
                    onChange={(e) => setHasTelegram(e.target.checked)}
                    className="rounded"
                  />
                  Только с Telegram
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Регистрация от
                  </label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Регистрация до
                  </label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>

              <Button
                className="w-full"
                variant="outline"
                onClick={loadRecipients}
                disabled={recipientsLoading}
              >
                {recipientsLoading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 size-4" />
                )}
                {recipientsLoaded ? "Обновить список" : "Найти получателей"}
              </Button>

              {recipientsLoaded && (
                <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                  {recipients.length > 0 ? (
                    <p>
                      Найдено{" "}
                      <span className="font-semibold">{recipients.length}</span>{" "}
                      {recipients.length === 1
                        ? "получатель"
                        : recipients.length < 5
                          ? "получателя"
                          : "получателей"}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      Получатели не найдены. Измените фильтры.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <Button
                className="w-full"
                size="lg"
                disabled={
                  !message.trim() || recipients.length === 0 || creating
                }
                onClick={handleCreate}
              >
                {creating && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Создать рассылку
              </Button>
              <p className="mt-2 text-xs text-center text-muted-foreground">
                Рассылка будет создана, но не отправлена.
                <br />
                Отправить можно будет на следующем шаге.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TagButton({
  label,
  onClick,
  title,
  className,
}: {
  label: string;
  onClick: () => void;
  title: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded border px-2 py-0.5 text-sm hover:bg-muted transition-colors ${className ?? ""}`}
    >
      {label}
    </button>
  );
}
