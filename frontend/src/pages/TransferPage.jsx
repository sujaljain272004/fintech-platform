import { useMemo, useState } from "react";
import { BadgeCheck, Phone, Search, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import WalletCard from "../components/WalletCard";
import { searchRecipientByPhone, transferMoney } from "../services/walletService";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatDateTime, truncateHash } from "../utils/formatters";
import PageTransition from "../components/ui/PageTransition";
import { EmptyState } from "../components/ui/StateBlocks";

const TransferPage = () => {
  const { t } = useTranslation();
  const { user, wallet, refreshSession } = useAuth();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");
  const [recipientError, setRecipientError] = useState("");
  const [recipientPreview, setRecipientPreview] = useState(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSend = useMemo(
    () => Boolean(recipientPreview && amount && Number(amount) > 0 && !submitting),
    [amount, recipientPreview, submitting]
  );

  const handleRecipientLookup = async () => {
    setSearching(true);
    setRecipientError("");
    setError("");
    setReceipt(null);

    try {
      const preview = await searchRecipientByPhone(recipient.trim());
      setRecipientPreview(preview);
    } catch (err) {
      setRecipientPreview(null);
      setRecipientError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setReceipt(null);

    try {
      const response = await transferMoney({
        recipient: recipientPreview.phoneNumber,
        recipientType: "phone",
        amount: Number(amount),
        note: note.trim(),
      });
      await refreshSession();
      setAmount("");
      setNote("");
      setReceipt(response.data.successReceipt);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition className="space-y-6">
      <div className="topbar-shell">
        <div>
          <p className="page-kicker">{t("transfer")}</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight">{t("transferHint")}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
            Search a real recipient by phone number, preview the wallet, and send with a blockchain-style receipt.
          </p>
        </div>
        <div className="rounded-3xl bg-teal-50 px-4 py-3 text-sm text-teal-800 dark:bg-teal-500/10 dark:text-teal-200">
          {t("realTransferHint")}
        </div>
      </div>

      <WalletCard wallet={wallet} profile={user} />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.72fr]">
        <div className="glass-panel max-w-3xl">
        <div className="mb-6">
          <h2 className="section-title">{t("transfer")}</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t("transferHint")}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="field-label">{t("recipientPhone")}</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <input
                  className="field-input"
                  value={recipient}
                  onChange={(event) => {
                    setRecipient(event.target.value);
                    setRecipientPreview(null);
                    setRecipientError("");
                  }}
                  placeholder={t("recipientPlaceholder")}
                  required
                />
              </div>
              <button
                type="button"
                className="secondary-button gap-2"
                onClick={handleRecipientLookup}
                disabled={searching || !recipient.trim()}
              >
                <Search size={16} />
                {searching ? t("searching") : t("findRecipient")}
              </button>
            </div>
          </div>

          {recipientError ? (
            <p className="text-sm font-semibold text-rose-600">{recipientError}</p>
          ) : null}

          {recipientPreview ? (
            <div className="soft-panel">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-3xl text-lg font-extrabold text-white"
                  style={{ backgroundColor: recipientPreview.avatarColor }}
                >
                  {recipientPreview.initials}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">{recipientPreview.fullName}</p>
                    <span className="pill-chip gap-1">
                      <BadgeCheck size={12} />
                      {recipientPreview.verificationStatus}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {recipientPreview.phoneNumber}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {t("walletId")}: {recipientPreview.walletNumber}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {!recipientPreview && recipient ? (
            <EmptyState
              title="Preview recipient"
              description="Search a phone number to confirm the destination wallet before sending funds."
            />
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">{t("amount")}</label>
              <input
                className="field-input"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="500"
                disabled={!recipientPreview}
                required
              />
            </div>
            <div>
              <label className="field-label">{t("note")}</label>
              <input
                className="field-input"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={t("notePlaceholder")}
                disabled={!recipientPreview}
              />
            </div>
          </div>

          {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}
          {receipt ? (
            <div className="surface-stack border-emerald-100 bg-emerald-50/70 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
              <p className="font-bold">{t("transferSuccess")}</p>
              <p>{t("amountSent")}: {formatCurrency(receipt.amount)}</p>
              <p>{t("recipientName")}: {receipt.receiverName}</p>
              <p>{t("transactionId")}: {receipt.transactionId}</p>
              <p>{t("timestamp")}: {formatDateTime(receipt.timestamp)}</p>
              <p>{t("hash")}: {truncateHash(receipt.hash || "", 10, 10)}</p>
            </div>
          ) : null}

          <button type="submit" className="primary-button w-full gap-2" disabled={!canSend}>
            <Send size={16} />
            {submitting ? "Sending..." : t("sendNow")}
          </button>
        </form>
        </div>

        <div className="space-y-4">
          <div className="section-shell">
            <p className="page-kicker">Security</p>
            <h3 className="mt-3 text-2xl font-extrabold tracking-tight">Transfer safely</h3>
            <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
              Every transfer is checked against the recipient wallet and logged with a ledger hash for traceability.
            </p>
          </div>
          <div className="section-shell">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Current wallet</p>
            <p className="mt-2 text-2xl font-extrabold">{formatCurrency(wallet?.balance || 0, wallet?.currency || "INR")}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{user?.fullName}</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default TransferPage;
