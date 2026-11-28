// In-memory checkpoint storage. Rendering objects stay owned by the game adapter.
export class WaveCheckpoint {
 constructor(){this.state=null;this.spent=0;}
 capture(state){this.state=structuredClone(state);this.spent=0;}
 get available(){return Math.max(0,(this.state?.items?.['golden-cup']||0)-this.spent);}
 consume(){if(!this.available)return null;this.spent++;const restored=structuredClone(this.state);restored.items['golden-cup']=Math.max(0,(restored.items['golden-cup']||0)-this.spent);return restored;}
 clear(){this.state=null;this.spent=0;}
}
