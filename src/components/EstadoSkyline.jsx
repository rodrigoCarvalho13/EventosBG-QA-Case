import React from "react";
import BrasiliaSkyline from "@/components/BrasiliaSkyline";
import { useEstado } from "@/lib/regiao";

// Pétalas e miolo de um girassol (Praça dos Girassóis, em Palmas).
function Girassol({ cx, cy, r }) {
  const petalas = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return `M${(cx + c * r * 1.25).toFixed(1)} ${(cy + s * r * 1.25).toFixed(1)}L${(cx + c * r * 2).toFixed(1)} ${(cy + s * r * 2).toFixed(1)}`;
  }).join("");
  return (
    <>
      <circle cx={cx} cy={cy} r={r} />
      <path d={petalas} />
      <path d={`M${cx} ${cy + r}V104`} />
    </>
  );
}

// Contornos do principal ponto turístico de cada estado (DF fica com a silhueta do Congresso).
const ARTES = {
  // Palácio Rio Branco
  AC: (
    <>
      <path d="M130 104h220M138 104V66h204v38" />
      <path d="M204 66l36-24 36 24Z" />
      <path d="M208 66v38M226 66v38M254 66v38M272 66v38" />
      <path d="M150 80h12M150 92h12M318 80h12M318 92h12M178 80h10M292 80h10" />
      <path d="M240 42v-10" />
    </>
  ),
  // Jangada e coqueiros de Pajuçara
  AL: (
    <>
      <path d="M140 108C142 82 150 62 164 44" />
      <path d="M164 44c-18-4-32 2-40 14M164 44c-10-12-26-16-40-12M164 44c10-12 26-14 40-8M164 44c12 2 24 10 28 22M164 44c-2-14 4-26 14-32" />
      <path d="M340 108C338 82 330 62 316 44" />
      <path d="M316 44c18-4 32 2 40 14M316 44c10-12 26-16 40-12M316 44c-10-12-26-14-40-8M316 44c-12 2-24 10-28 22M316 44c2-14-4-26-14-32" />
      <path d="M210 92h80l-10 14h-60Z" />
      <path d="M250 92V50M250 52l32 38h-32" />
      <path d="M190 106c8-4 16-4 24 0M286 106c8-4 16-4 24 0" opacity=".6" />
    </>
  ),
  // Fortaleza de São José de Macapá
  AP: (
    <>
      <path d="M100 104l36-34h208l36 34Z" />
      <path d="M144 70v-8h12v8M170 70v-8h12v8M196 70v-8h12v8M272 70v-8h12v8M298 70v-8h12v8M324 70v-8h12v8" />
      <path d="M168 104V86h144v18" />
      <path d="M226 104V92a14 14 0 0 1 28 0v12" />
      <path d="M240 70V38M240 38h24v10h-24" />
    </>
  ),
  // Teatro Amazonas
  AM: (
    <>
      <path d="M202 72a38 38 0 0 1 76 0" />
      <path d="M240 34c-14 8-20 22-20 38M240 34c14 8 20 22 20 38M240 34v38" />
      <path d="M236 34v-10h8v10M240 24v-8" />
      <path d="M140 104V72h200v32M130 104h220" />
      <path d="M160 104V84a8 8 0 0 1 16 0v20M196 104V84a8 8 0 0 1 16 0v20M268 104V84a8 8 0 0 1 16 0v20M304 104V84a8 8 0 0 1 16 0v20" />
      <path d="M140 72h200" />
    </>
  ),
  // Elevador Lacerda
  BA: (
    <>
      <path d="M200 104V14h26v90M196 14h34" />
      <path d="M200 34h26M200 54h26M200 74h26M200 94h26" />
      <path d="M226 34h120v8H226" />
      <path d="M300 42v62M380 42v62M300 42h80" />
      <path d="M312 42V28h24v14M344 42V24h24v18" />
      <path d="M110 104h90" />
      <path d="M120 96c8-4 16-4 24 0M150 96c8-4 16-4 24 0" opacity=".6" />
    </>
  ),
  // Pedra Furada, em Jericoacoara
  CE: (
    <>
      <path d="M170 104C170 64 182 34 226 32c44-2 68 30 68 72" />
      <path d="M212 104c0-24 8-38 22-38s22 14 22 38" />
      <circle cx="336" cy="46" r="12" />
      <path d="M316 70h40M322 78h28" opacity=".6" />
      <path d="M110 98c10-5 20-5 30 0" opacity=".6" />
    </>
  ),
  // Convento da Penha
  ES: (
    <>
      <path d="M100 104C150 100 170 62 204 58h104c34 4 56 40 86 46" />
      <path d="M204 58V38h104v20" />
      <path d="M244 38V18h24v20M256 18V6M251 11h10" />
      <path d="M244 18l12-8 12 8" />
      <path d="M218 50h8M234 50h4M276 50h4M292 50h8" />
      <path d="M214 38h22M276 38h22" />
    </>
  ),
  // Chapada dos Veadeiros
  GO: (
    <>
      <path d="M100 100L168 44l40 38 52-62 62 70 30-26 40 36" />
      <path d="M262 60v44M256 72v32M268 72v32" />
      <path d="M244 104a18 5 0 0 0 36 0" />
    </>
  ),
  // Lençóis Maranhenses
  MA: (
    <>
      <path d="M90 82c30-28 56-28 86 0 24 20 40 20 64 0 28-24 56-24 84 0 20 16 36 16 56 4" />
      <path d="M110 104c24-14 44-14 66 0M300 104c18-10 34-10 50 0" opacity=".7" />
      <ellipse cx="190" cy="96" rx="34" ry="5" />
      <ellipse cx="290" cy="90" rx="22" ry="4" />
      <circle cx="368" cy="34" r="10" />
    </>
  ),
  // Pantanal: tuiuiú
  MT: (
    <>
      <path d="M214 74c0-12 14-18 28-18s24 8 26 16c-6 14-22 22-38 22-10-2-16-8-16-20Z" />
      <path d="M262 64c8-12 10-30 6-44" />
      <path d="M268 20c6-2 12 0 14 4M268 20l24 6" />
      <path d="M234 94v10M248 94v10M228 104h12M242 104h12" />
      <path d="M214 74l-26 8" />
      <path d="M222 70c8 8 22 8 32 0" />
      <path d="M130 104V78M138 104V70M146 104V80M338 104V76M346 104V68M354 104V80" />
    </>
  ),
  // Gruta do Lago Azul, em Bonito
  MS: (
    <>
      <path d="M140 104V72c0-34 40-54 100-54s100 20 100 54v32" />
      <path d="M188 36l7 22 7-26M230 24l7 30 7-30M270 28l6 22 6-26M306 44l5 14 5-18" />
      <path d="M190 104l9-22 9 22M258 104l7-18 7 18" />
      <path d="M180 100c20-6 40-6 60 0M250 98c14-4 28-4 42 0" opacity=".7" />
    </>
  ),
  // Igreja da Pampulha
  MG: (
    <>
      <path d="M120 104c0-36 14-52 34-52s34 16 34 52" />
      <path d="M200 104c0-50 20-72 46-72s46 22 46 72" />
      <path d="M300 104c0-36 14-52 34-52s34 16 34 52" />
      <path d="M394 104V34l-16 70" />
      <path d="M154 52v-8M246 32v-8M334 52v-8" opacity=".6" />
    </>
  ),
  // Basílica de Nazaré
  PA: (
    <>
      <path d="M176 104V72h128v32M120 104h240" />
      <path d="M146 104V54h28v50M306 104V54h28v50" />
      <path d="M146 54l14-16 14 16M306 54l14-16 14 16M160 38v-10M320 38v-10" />
      <path d="M206 72a34 34 0 0 1 68 0" />
      <path d="M240 38V26M236 30h8" />
      <path d="M226 104V92a14 14 0 0 1 28 0v12" />
      <path d="M154 64h12M154 80h12M314 64h12M314 80h12" />
    </>
  ),
  // Farol do Cabo Branco
  PB: (
    <>
      <path d="M100 104V80c40 0 80-6 130-6h150v30" />
      <path d="M236 74l4-44h20l4 44" />
      <path d="M238 30h24l-4-8h-16ZM250 22v-8" />
      <path d="M238 46h24M237 60h26" />
      <path d="M230 22l-26-8M228 28l-28 2M270 22l26-8M272 28l28 2" />
    </>
  ),
  // Jardim Botânico de Curitiba
  PR: (
    <>
      <path d="M130 104V66l32-26h156l32 26v38Z" />
      <path d="M162 40v64M194 40v64M226 40v64M254 40v64M286 40v64M318 40v64" />
      <path d="M130 66h220M130 86h220" />
      <path d="M100 104h280" />
      <path d="M108 100V90M116 100V86M366 100V90M374 100V86" />
    </>
  ),
  // Morro Dois Irmãos, em Fernando de Noronha
  PE: (
    <>
      <path d="M140 104c10-20 22-50 34-74 4-8 10-8 14 0 8 20 14 50 18 74" />
      <path d="M222 104c8-18 16-34 24-48 3-6 8-6 11 0 8 14 14 30 20 48" />
      <path d="M100 104c10-6 20-6 30 0s20 6 30 0M300 104c10-6 20-6 30 0s20 6 30 0" opacity=".6" />
      <circle cx="350" cy="40" r="10" />
    </>
  ),
  // Sete Cidades
  PI: (
    <>
      <path d="M154 104l3-30M166 104l-3-30M130 74c0-16 14-24 30-24s30 8 30 24Z" />
      <path d="M242 104l3-46M258 104l-3-46M214 58c0-20 16-30 36-30s36 10 36 30Z" />
      <path d="M329 104l2-26M341 104l-2-26M310 78c0-14 12-20 25-20s25 6 25 20Z" />
    </>
  ),
  // Cristo Redentor
  RJ: (
    <>
      <path d="M100 104C150 100 190 72 220 66h40c30 6 70 34 120 38" />
      <path d="M226 66V54h28v12" />
      <path d="M232 54l3-28h10l3 28Z" />
      <path d="M202 28h76" />
      <circle cx="240" cy="18" r="5" />
    </>
  ),
  // Ponte Newton Navarro
  RN: (
    <>
      <path d="M100 88h280" />
      <path d="M236 88V18h8v70" />
      <path d="M240 24L150 88M240 24L180 88M240 24L210 88M240 24L270 88M240 24L300 88M240 24L330 88" />
      <path d="M150 88v16M240 88v16M330 88v16" />
      <path d="M100 104h280" opacity=".6" />
    </>
  ),
  // Usina do Gasômetro
  RS: (
    <>
      <path d="M130 104V64h140v40M126 64h148" />
      <path d="M276 104V14h14v90M274 14h18" />
      <path d="M144 104V84a8 8 0 0 1 16 0v20M174 104V84a8 8 0 0 1 16 0v20M204 104V84a8 8 0 0 1 16 0v20M234 104V84a8 8 0 0 1 16 0v20" />
      <path d="M310 98c10-5 20-5 30 0s20 5 30 0" opacity=".6" />
    </>
  ),
  // Locomotiva da Madeira-Mamoré
  RO: (
    <>
      <path d="M170 70h120v22H170Z" />
      <path d="M178 70V48h14v22M174 48h22" />
      <path d="M232 70a10 8 0 0 1 20 0" />
      <path d="M290 92V56h50v48h-50M284 56h62" />
      <path d="M300 66h28v14h-28Z" />
      <circle cx="192" cy="98" r="9" />
      <circle cx="226" cy="98" r="9" />
      <circle cx="330" cy="92" r="12" />
      <path d="M192 98h34M170 92l-20 14h22" />
      <path d="M100 110h280" />
    </>
  ),
  // Monte Roraima
  RR: (
    <>
      <path d="M140 104c10-24 12-44 20-66h160c10 22 14 42 24 66" />
      <path d="M176 40v48M200 40v36M230 40v56M262 40v40M290 40v52" opacity=".6" />
      <path d="M344 104c4-20 6-34 12-46h30c2 14 4 28 8 46" />
      <path d="M112 62c-8 0-8-12 4-12 2-10 20-10 22 0 10 0 10 12 0 12Z" />
    </>
  ),
  // Ponte Hercílio Luz
  SC: (
    <>
      <path d="M100 88h280" />
      <path d="M156 104V30h8v74M316 104V30h8v74" />
      <path d="M160 30Q240 74 320 30M160 30L100 84M320 30L380 84" />
      <path d="M180 40v48M200 47v41M220 51v37M240 52v36M260 51v37M280 47v41M300 40v48" />
      <path d="M100 104h280" opacity=".6" />
    </>
  ),
  // MASP
  SP: (
    <>
      <path d="M110 34h260v34H110Z" />
      <path d="M110 42h260M142 42v26M178 42v26M214 42v26M250 42v26M286 42v26M322 42v26" />
      <path d="M132 68v36h14V68M334 68v36h14V68" />
      <path d="M100 104h280" />
    </>
  ),
  // Cânion do Xingó
  SE: (
    <>
      <path d="M100 26L140 30L156 58L170 80L200 104" />
      <path d="M380 18L340 28L330 56L318 78L290 104" />
      <path d="M118 44l22 2M130 58l22 2M142 74l20 2M362 36l-22 2M350 52l-20 2M338 68l-18 2" opacity=".6" />
      <path d="M230 98h32l-4 6h-24ZM240 98v-6h14v6" />
      <path d="M200 104h90" />
    </>
  ),
  // Praça dos Girassóis, em Palmas
  TO: (
    <>
      <Girassol cx={170} cy={56} r={9} />
      <Girassol cx={240} cy={36} r={12} />
      <Girassol cx={312} cy={60} r={9} />
      <path d="M240 84c-14-2-20-10-22-16M240 90c14-2 20-8 22-14" />
      <path d="M170 88c-10-2-14-8-16-14M312 90c10-2 14-8 16-14" />
    </>
  ),
};

// Fundo dos cabeçalhos: mesmo traço e cor da silhueta de Brasília (DF), trocando só o desenho
// pelo principal ponto turístico do estado. `forte` é a variação mais marcada (faixa de CTA).
export default function EstadoSkyline({ className = "", forte = false }) {
  const { sigla } = useEstado();
  const cor = forte ? "text-accent/20" : "text-accent/15";
  const arte = ARTES[sigla];
  if (!arte) return <BrasiliaSkyline className={`${className} ${cor}`} />;
  return (
    <svg
      viewBox="0 0 480 120"
      preserveAspectRatio="xMidYMax meet"
      className={`${className} ${cor}`}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {arte}
      <path d="M0 110h480" opacity=".5" />
    </svg>
  );
}
