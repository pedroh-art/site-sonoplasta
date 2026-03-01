export function playAudio(url: string) {
  const audio = new Audio(url); // cria o player em memória
  audio.play();                 // toca
}