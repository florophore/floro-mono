declare module "*.json?inline" {
    const content: any;
    export default content;
  }
  
  declare module "*.json" {
    const content: any;
    export default content;
  }
  