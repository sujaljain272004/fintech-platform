import { ShieldCheck, WalletCards } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../utils/formatters";

const WalletCard = ({ wallet, profile }) => {
  const { t } = useTranslation();

  if (!wallet) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-[30px] bg-slate-950 p-6 text-white shadow-fintech dark:bg-gradient-to-br dark:from-teal-400 dark:via-cyan-300 dark:to-emerald-200 dark:text-slate-950">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl dark:bg-white/40" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70 dark:text-slate-700">
            {t("walletBalance")}
          </p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-tight">
            {formatCurrency(wallet.balance, wallet.currency)}
          </h2>
          <p className="mt-4 text-sm text-white/70 dark:text-slate-700">
            {t("walletId")}: {wallet.walletNumber}
          </p>
          <p className="mt-1 text-sm text-white/70 dark:text-slate-700">
            {profile?.phoneNumber}
          </p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10 dark:bg-slate-950/10">
          <WalletCards size={26} />
        </div>
      </div>
      <div className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white dark:bg-slate-950/10 dark:text-slate-800">
        <ShieldCheck size={16} />
        {t("secureLedger")}
      </div>
    </div>
  );
};

export default WalletCard;
