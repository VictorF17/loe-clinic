import Image from "next/image";
import { ArrowUpRight, AtSign, HeartHandshake, Sparkles } from "lucide-react";
import { LoeScrollExperience } from "@/components/loe/scroll-experience";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

const instagramUrl = "https://www.instagram.com/loeclinic/";
const whatsappUrl = "https://wa.me/5511952431707";

const pillars = [
  { icon: Sparkles, title: "Beleza com intenção", text: "Uma abordagem delicada, pensada para valorizar o que faz você única." },
  { icon: HeartHandshake, title: "Cuidado de verdade", text: "Um espaço acolhedor, com escuta e atenção em cada etapa da sua experiência." },
  { icon: AtSign, title: "Acompanhe a Loê", text: "Conheça o universo da clínica, novidades e inspirações pelo Instagram." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f3ee] text-[#54382c]">
      <section className="relative isolate min-h-[760px] overflow-hidden px-5 pb-14 pt-5 sm:px-10 lg:min-h-[800px] lg:px-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_12%,#ead9cc_0,transparent_25%),radial-gradient(circle_at_10%_75%,#efe5dc_0,transparent_30%),linear-gradient(135deg,#fcfaf7_0%,#f4ede7_100%)]" />
        <div className="absolute -right-24 top-40 -z-10 size-[32rem] rounded-full border border-[#b98970]/25 sm:size-[42rem]" />
        <div className="absolute -right-6 top-52 -z-10 size-[23rem] rounded-full border border-[#b98970]/20 sm:size-[31rem]" />
        <header className="mx-auto flex max-w-7xl items-center justify-between border-b border-[#7b5542]/15 pb-4">
          <a href="#inicio" aria-label="Loê Clinic — início" className="flex items-center gap-3"><span className="font-serif text-3xl italic tracking-tight sm:text-4xl">Loê</span><span className="border-l border-[#7b5542]/40 pl-3 text-[0.6rem] font-medium tracking-[0.28em] uppercase">Clinic</span></a>
          <nav className="hidden items-center gap-8 text-sm text-[#6d4c3d] md:flex"><a className="transition-colors hover:text-[#a26b50]" href="#essencia">A essência</a><a className="transition-colors hover:text-[#a26b50]" href="#experiencia">A experiência</a></nav>
          <div className="flex items-center gap-2">
            <a href={instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram da Loê Clinic" className="inline-flex items-center gap-2 rounded-full border border-[#7b5542]/35 bg-white/35 px-3 py-2.5 text-xs font-semibold tracking-wide text-[#603d2e] transition hover:border-[#7b5542] hover:bg-white/70 sm:px-4"><AtSign className="size-5" strokeWidth={1.8} /><span className="hidden sm:inline">Instagram</span></a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp da Loê Clinic" className="inline-flex items-center gap-2 rounded-full border border-[#603d2e] bg-[#603d2e] px-3 py-2.5 text-xs font-semibold tracking-wide text-[#fffaf5] transition hover:bg-[#7a503d] sm:px-4"><WhatsAppIcon className="size-5" /><span className="hidden sm:inline">WhatsApp</span></a>
          </div>
        </header>
        <div id="inicio" className="mx-auto grid max-w-7xl items-center gap-12 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:pt-28">
          <div className="max-w-2xl"><p className="mb-6 text-xs font-semibold tracking-[0.25em] text-[#a26b50] uppercase">Seu tempo. Sua beleza. Seu momento.</p><h1 className="font-serif text-5xl leading-[0.94] tracking-tight text-[#513427] sm:text-7xl lg:text-8xl">Beleza que respeita <span className="italic">a sua essência.</span></h1><p className="mt-8 max-w-lg text-lg leading-relaxed text-[#76594b] sm:text-xl">Na Loê Clinic, cada detalhe é um convite para você se sentir bem na sua própria pele.</p><div className="mt-10 flex flex-wrap gap-4"><a href="#experiencia" className="inline-flex items-center gap-2 rounded-full bg-[#603d2e] px-6 py-3.5 text-sm font-medium text-[#fffaf5] transition hover:bg-[#7a503d]">Conheça a Loê <ArrowUpRight className="size-4" /></a></div></div>
          <div className="relative mx-auto w-full max-w-md lg:max-w-none"><div className="absolute -inset-4 rounded-[2.5rem] bg-[#d9bca8]/30 blur-2xl" /><div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-white/70 bg-[#f4efea] shadow-[0_30px_70px_rgba(93,60,42,0.14)]"><Image src="/loe-clinic-brand.jpeg" alt="Identidade visual da Loê Clinic" fill priority sizes="(min-width: 1024px) 42vw, 90vw" className="object-cover" /></div><p className="absolute -bottom-5 -left-3 rounded-full bg-[#fffaf5] px-5 py-3 text-xs font-medium tracking-[0.16em] text-[#76594b] uppercase shadow-sm sm:-left-6">Um cuidado que começa no olhar</p></div>
        </div>
      </section>
      <LoeScrollExperience />
      <section id="essencia" className="border-y border-[#7b5542]/10 bg-[#fffdfa] px-5 py-20 sm:px-10 lg:px-16 lg:py-28"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="text-xs font-semibold tracking-[0.25em] text-[#a26b50] uppercase">A essência Loê</p><h2 className="mt-5 font-serif text-4xl leading-tight text-[#513427] sm:text-5xl">Cuidar de você também é uma forma de celebrar quem você é.</h2></div><div className="mt-14 grid gap-8 md:grid-cols-3">{pillars.map(({ icon: Icon, title, text }) => <article key={title} className="border-t border-[#7b5542]/25 pt-6"><Icon className="size-5 text-[#a26b50]" strokeWidth={1.5} /><h3 className="mt-8 font-serif text-2xl text-[#54382c]">{title}</h3><p className="mt-3 max-w-xs leading-relaxed text-[#76594b]">{text}</p></article>)}</div></div></section>
      <section id="experiencia" className="px-5 py-20 sm:px-10 lg:px-16 lg:py-28"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 rounded-[2.5rem] bg-[#603d2e] px-7 py-12 text-[#fffaf5] sm:px-12 lg:flex-row lg:items-end lg:px-16 lg:py-16"><div className="max-w-2xl"><p className="text-xs font-semibold tracking-[0.25em] text-[#e8c4aa] uppercase">Vamos conversar?</p><h2 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">Seu próximo momento de cuidado começa aqui.</h2></div><a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-3 rounded-full bg-[#fffaf5] px-6 py-3.5 text-sm font-semibold text-[#603d2e] transition hover:bg-[#f0ded1]">Falar pelo WhatsApp <WhatsAppIcon className="size-4" /></a></div></section>
      <footer className="px-5 pb-8 text-center text-xs tracking-[0.16em] text-[#8a6b5c] uppercase">Loê Clinic · Cuidado em cada detalhe</footer>
    </main>
  );
}
