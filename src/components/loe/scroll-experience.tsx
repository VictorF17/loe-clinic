"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const treatments = [
  ["resultado-01.jpeg", "Cuidado personalizado", "Tudo começa ao entender você.", "Cada escolha nasce da escuta, da técnica e do respeito pela sua essência."],
  ["resultado-02.jpeg", "Precisão em cada detalhe", "Beleza com intenção e leveza.", "Um olhar atento para valorizar o que já é único em você."],
  ["resultado-03.jpeg", "Resultados reais", "A melhor versão ainda é a sua.", "Resultados sutis, pensados para acompanhar o seu jeito de se expressar."],
  ["resultado-04.jpeg", "Naturalidade", "Harmonia que se sente no espelho.", "Um resultado que conversa com seus traços, com equilíbrio e delicadeza."],
  ["resultado-05.jpeg", "Seu momento", "Cuidar de você muda o seu dia.", "Uma pausa para se reconhecer, se renovar e se sentir ainda mais confiante."],
  ["resultado-06.jpeg", "A experiência Loê", "Um espaço para você se sentir bem.", "Acolhimento e atenção em todas as etapas da sua experiência."],
  ["resultado-07.jpeg", "Confiança", "Quando o cuidado encontra a sua essência.", "Porque beleza também é se reconhecer com mais tranquilidade."],
  ["resultado-08.jpeg", "Loê Clinic", "O seu cuidado começa aqui.", "Seu tempo, sua beleza e o seu momento — do seu jeito."],
] as const;

function AnimatedTitle({ title }: { title: string }) {
  return <h3 className="font-serif text-3xl leading-[1.02] text-[#513427] sm:text-5xl lg:text-6xl">{title.split(" ").map((word, index) => <span key={`${word}-${index}`} className="loe-reveal-word mr-[0.24em] inline-block whitespace-nowrap">{word}</span>)}</h3>;
}

export function LoeScrollExperience() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      const scene = root.current?.querySelector<HTMLElement>(".loe-treatment-scene");
      const visual = root.current?.querySelector<HTMLElement>(".loe-treatment-visual");
      const copyFrame = root.current?.querySelector<HTMLElement>(".loe-treatment-copy-frame");
      const images = gsap.utils.toArray<HTMLElement>(".loe-treatment-image");
      const copy = gsap.utils.toArray<HTMLElement>(".loe-treatment-copy");
      const words = copy.map((item) => item.querySelectorAll<HTMLElement>(".loe-reveal-word"));
      const essence = document.getElementById("essencia");
      if (!scene || !visual || !copyFrame) return;

      // Estado inicial fora das timelines: a entrada e a saída são disparadas
      // por triggers próprios, antes e depois do pin.
      gsap.set(images, { autoAlpha: 0, scale: 1.05 });
      gsap.set(copy.slice(1), { autoAlpha: 0, y: 28 });
      gsap.set(words.flat(), { autoAlpha: 0, y: 18 });

      const pinStart = () => window.innerWidth < 768 ? "top 4%" : "top 12%";

      // Só as trocas de imagem ficam presas na tela; o pin começa com a
      // primeira imagem já visível.
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: scene,
          start: pinStart,
          end: () => `+=${Math.round(window.innerHeight * (treatments.length - 1) * (window.innerWidth < 768 ? 0.62 : 0.72))}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 1,
        },
      });
      treatments.slice(1).forEach((_, index) => timeline.to({}, { duration: 0.4 }).to(images[index], { autoAlpha: 0, scale: 0.96, duration: 0.75, ease: "power1.inOut" }).to(images[index + 1], { autoAlpha: 1, scale: 1, duration: 0.75, ease: "power1.inOut" }, "<").to(copy[index], { autoAlpha: 0, y: -18, duration: 0.55, ease: "power1.inOut" }, "<0.08").to(copy[index + 1], { autoAlpha: 1, y: 0, duration: 0.55, ease: "power1.inOut" }, "<").to(words[index + 1], { autoAlpha: 1, y: 0, stagger: 0.045, duration: 0.35, ease: "power2.out" }, "<0.1"));

      // Entrada: acontece enquanto o título "Resultados Loê" sai da tela,
      // no trecho entre a cena aparecer e o pin começar — sem espaço vazio.
      gsap.timeline({ scrollTrigger: { trigger: scene, start: "top bottom", end: pinStart, scrub: 0.8, invalidateOnRefresh: true } })
        .fromTo(visual, { autoAlpha: 0, scale: 1, rotate: 0, clipPath: "inset(10% 10% round 36px)" }, { autoAlpha: 1, scale: 1, rotate: 0, clipPath: "inset(0% 0% round 32px)", duration: 0.7, ease: "power2.out" })
        .to(images[0], { autoAlpha: 1, scale: 1, duration: 0.75, ease: "power1.inOut" }, "<")
        .fromTo(copyFrame, { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, "<0.12")
        .to(words[0], { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.45, ease: "power3.out" }, "<0.16");

      // Saída: começa quando o pin solta e termina enquanto "A essência Loê"
      // entra — na volta, a imagem reaparece antes da essência sair da tela.
      gsap.timeline({ scrollTrigger: { trigger: scene, start: () => timeline.scrollTrigger!.end, end: () => timeline.scrollTrigger!.end + window.innerHeight * 0.55, scrub: 0.8, invalidateOnRefresh: true } })
        .to(visual, { autoAlpha: 0, scale: 0.8, rotate: 6, clipPath: "inset(20% 18% round 36px)", duration: 0.7, ease: "power2.in" })
        .to(copyFrame, { autoAlpha: 0, y: -28, duration: 0.55, ease: "power2.in" }, "<");
      if (essence) gsap.fromTo(essence, { autoAlpha: 0.2, y: 72, scale: 0.96, clipPath: "inset(16% 8% round 40px)" }, { autoAlpha: 1, y: 0, scale: 1, clipPath: "inset(0% 0% round 0px)", ease: "power2.out", scrollTrigger: { trigger: essence, start: "top 92%", end: "top 36%", scrub: 0.8 } });
    }, root);
    return () => context.revert();
  }, []);

  return <section ref={root} id="tratamentos" className="bg-[#f7f3ee] px-5 py-20 sm:px-10 lg:px-16 lg:py-28"><div className="mx-auto max-w-7xl"><div className="max-w-xl"><p className="text-xs font-semibold tracking-[0.25em] text-[#a26b50] uppercase">Resultados Loê</p><h2 className="mt-5 font-serif text-4xl leading-tight text-[#513427] sm:text-5xl">Cada escolha, uma forma mais sua de se sentir bem.</h2></div><div className="relative mt-10 sm:mt-14"><div className="loe-treatment-scene grid h-[92svh] min-h-[590px] items-center gap-5 md:h-[70vh] md:min-h-[520px] md:gap-10 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-20"><div className="loe-treatment-visual relative mx-auto h-[42svh] min-h-[290px] w-full max-w-[430px] overflow-hidden rounded-[2rem] bg-[#e9ddd4] shadow-[0_28px_65px_rgba(93,60,42,0.16)] md:h-[48vh] md:min-h-[350px] lg:h-[58vh] lg:max-w-[470px]">{treatments.map(([image, label], index) => <div key={image} className="loe-treatment-image absolute inset-0"><Image src={`/treatments/${image}`} alt={`Resultado de ${label} na Loê Clinic`} fill sizes="(min-width: 1024px) 38vw, 90vw" className="object-cover" priority={index === 0} /></div>)}</div><div className="loe-treatment-copy-frame relative min-h-[190px] md:min-h-[270px]">{treatments.map(([, label, title, description], index) => <div key={label} className="loe-treatment-copy absolute inset-0 flex flex-col justify-center"><p className="mb-3 text-xs font-semibold tracking-[0.22em] text-[#a26b50] uppercase md:mb-5 md:tracking-[0.25em]">0{index + 1} · {label}</p><AnimatedTitle title={title} /><p className="mt-4 max-w-md text-sm leading-relaxed text-[#76594b] sm:mt-7 sm:text-lg">{description}</p></div>)}</div></div></div></div></section>;
}
