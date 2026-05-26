import {
  Activity,
  Headphones,
  PackageOpen,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { PrivilegeCard } from "@/components/PrivilegeCard";
import {
  KIT_COOLDOWN_HOURS,
  PRIVILEGE_DURATION_DAYS,
  PRIVILEGES,
} from "@/lib/constants";

const stats = [
  {
    label: "Мгновенная выдача",
    value: "После покупки",
    icon: Zap,
  },
  {
    label: "Кулдаун китов",
    value: `${KIT_COOLDOWN_HOURS} часов`,
    icon: PackageOpen,
  },
  {
    label: "Безопасность",
    value: "Steam OpenID",
    icon: ShieldCheck,
  },
  {
    label: "Поддержка",
    value: "24/7",
    icon: Headphones,
  },
];

export default function StorePage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
      <section className="hero-shell relative mb-8 overflow-hidden rounded-lg border border-white/10 bg-[#0b0d11] p-6 shadow-2xl shadow-black/50 sm:p-10 lg:min-h-[520px]">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-sm font-bold text-orange-300">
            <Activity className="h-4 w-4" />
              Привилегии для RUST
            </div>
            <h1 className="max-w-3xl font-heading text-4xl font-bold text-zinc-100 sm:text-5xl md:text-6xl lg:text-7xl">
              Улучшай свой{" "}
              <span className="block text-orange-500">игровой опыт</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-300">
              Покупай VIP-уровни за Scrap Coins, активируй привилегии на сервере
              и забирай наборы с отдельным кулдауном.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
              <a
                href="#store"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-orange-500 px-5 text-sm font-bold text-white shadow-lg shadow-orange-950/40 transition hover:bg-orange-400"
              >
                Перейти в магазин
              </a>
              <a
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-zinc-100 transition hover:border-orange-500/40 hover:bg-orange-500/10"
              >
                Мои киты
              </a>
            </div>
          </div>

          <div className="grid gap-3 lg:ml-auto lg:w-[340px]">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.08] p-4 backdrop-blur-md"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase text-zinc-300">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div id="store" className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-zinc-500">
            Популярные привилегии
          </p>
          <h2 className="font-heading text-3xl font-bold text-zinc-100">
            Магазин
          </h2>
        </div>
        <p className="hidden text-sm text-zinc-500 sm:block">
          Доступ на {PRIVILEGE_DURATION_DAYS} дней
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {PRIVILEGES.map((privilege) => (
          <PrivilegeCard key={privilege.tier} privilege={privilege} />
        ))}
      </section>

      <section className="mt-6 grid gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 md:grid-cols-4">
        {[
          ["Подарки", "Бонусы за активность"],
          ["Скидки", "Для постоянных игроков"],
          ["Сообщество", "Играй вместе с сервером"],
          ["Надежность", "Защита данных Steam"],
        ].map(([title, text]) => (
          <div key={title} className="rounded-lg border border-white/10 bg-black/20 p-4">
            <p className="font-semibold text-zinc-100">{title}</p>
            <p className="mt-1 text-sm text-zinc-500">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
