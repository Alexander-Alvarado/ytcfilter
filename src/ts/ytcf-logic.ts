export function shouldFilterMessage(action: Chat.MessageAction, filters: YtcF.ChatFilter[]): boolean {
  const msg = action.message;
  for (const filter of filters) {
    if (filter.enabled) {
      let numSatisfied = 0;
      for (const condition of filter.conditions) {
        if (condition.type === 'boolean') {
          if ((
            condition.property === 'superchat' && Boolean(msg.superChat) === condition.invert
          ) || (
            msg.author.types.includes(condition.property) === condition.invert
          )) numSatisfied++;
        } else {
          let compStr = '';
          switch (condition.property) {
            case 'message':
              compStr = stringifyRuns(msg.message);
              break;
            case 'authorName':
              compStr = msg.author.name;
              break;
            case 'authorChannelId':
              compStr = msg.author.id;
              break;
          }
          if (condition.value === '') continue;
          if (condition.type !== 'regex') {
            const s1 = condition.caseSensitive ? compStr : compStr.toLowerCase();
            const s2 = condition.caseSensitive ? condition.value : condition.value.toLowerCase();
            const result = s1[condition.type](s2);
            if (result === condition.invert) {
              break;
            }
          } else {
            const regex = new RegExp(condition.value, condition.caseSensitive ? '' : 'i');
            const result = regex.test(compStr);
            if (result === condition.invert) {
              break;
            }
          }
        }
        numSatisfied++;
      }
      if (numSatisfied === filter.conditions.length) {
        return true;
      }
    }
  }
  return false;
}

export function shouldActivatePreset(preset: YtcF.FilterPreset, info: SimpleVideoInfo): boolean {
  for (const trigger of preset.triggers) {
    let compStr = '';
    switch (trigger.property) {
      case 'channelId':
        compStr = info.channel.channelId;
        break;
      case 'channelName':
        compStr = info.channel.name;
        break;
      case 'channelHandle':
        compStr = info.channel.handle ?? '';
        break;
      case 'videoId':
        compStr = info.video.videoId;
        break;
      case 'videoTitle':
        compStr = info.video.title;
        break;
    }
    if (trigger.value === '') continue;
    if (trigger.type !== 'regex') {
      const s1 = trigger.caseSensitive ? compStr : compStr.toLowerCase();
      const s2 = trigger.caseSensitive ? trigger.value : trigger.value.toLowerCase();
      const result = s1[trigger.type](s2);
      if (result) return true;
    } else {
      const regex = new RegExp(trigger.value, trigger.caseSensitive ? '' : 'i');
      const result = regex.test(compStr);
      if (result) return true;
    }
  }
  return false;
}

export function getOverridePreset(presets: YtcF.FilterPreset[], info: SimpleVideoInfo): YtcF.FilterPreset | null {
  for (const preset of presets) {
    if (shouldActivatePreset(preset, info)) {
      return preset;
    }
  }
  return null;
}

export const stringifyRuns = (msg: Ytc.ParsedRun[]): string => {
  return msg.map(m => {
    if (m.type === 'text') {
      return m.text;
    } else if (m.type === 'emoji') {
      return `:${m.alt}:`;
    } else {
      return m.text;
    }
  }).join('');
};

const getV2Storage = async () => {
  return await new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get('@@vwe-persistence', (s) =>
        resolve(s['@@vwe-persistence'] || null)
      );
    } catch (e) {
      reject(e);
    }
  });
};

export const migrateV2toV3 = async () => {
  const v2 = await getV2Storage();
  if (v2) {
  }
};
