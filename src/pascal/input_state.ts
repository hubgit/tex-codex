export interface InStateRecord {
  stateField: number;
  indexField: number;
  startField: number;
  locField: number;
  limitField: number;
  nameField: number;
}

export function copyInStateRecord(value: InStateRecord): InStateRecord {
  return {
    stateField: value.stateField,
    indexField: value.indexField,
    startField: value.startField,
    locField: value.locField,
    limitField: value.limitField,
    nameField: value.nameField,
  };
}
