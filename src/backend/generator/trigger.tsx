import { getModifier, modifierMap } from '../keyCodeMap';

const generateModifierTrigger = (modifiers: string[], trigger: string) => {
  return `${modifiers
    .map((modifier) => getModifier(modifier))
    .join('')}${trigger}::`;
};

const generateGeneralTrigger = (triggerKeys: string[]): string => {
  const otherTriggers = triggerKeys.slice(1);

  const waitForOtherTriggers = otherTriggers
    .map((trigger) => `    KeyWait, ${trigger}, D T1`)
    .join('\n');
  return `~${triggerKeys[0]}::
  ${waitForOtherTriggers}`;
};

const getTriggerObject = (triggerKeys: string[]): TriggerObject => {
  const startTriggers = triggerKeys.slice(0, -1);

  if (
    startTriggers.every((trigger) => Object.keys(modifierMap).includes(trigger))
  ) {
    return {
      mode: 'modifier',
      string: generateModifierTrigger(startTriggers, triggerKeys.slice(-1)[0]),
    };
  }

  return { mode: 'general', string: generateGeneralTrigger(triggerKeys) };
};

export default getTriggerObject;
