// CSS module type definitions
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
