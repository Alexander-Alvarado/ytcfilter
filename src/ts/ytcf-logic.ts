export function shouldFilterMessage(action: Chat.MessageAction, filters: YtcF.ChatFilter[]): boolean {
  const msg = action.message;
  for (const filter of filters) {
    if (filter.enabled) {
      if (filter.condition.type !== 'boolean') {
        let compStr = '';
        switch (filter.condition.property) {
          case 'message':
            compStr = msg.message.map(m => {
              if (m.type === 'text') {
                return m.text;
              } else if (m.type === 'emoji') {
                return `:${m.alt}:`;
              } else {
                return m.text;
              }
            }).join('');
            break;
          case 'authorName':
            compStr = msg.author.name;
            break;
        }
        if (filter.condition.value === '') continue;
        if (filter.condition.type !== 'regex') {
          const s1 = filter.condition.caseSensitive ? compStr : compStr.toLowerCase();
          const s2 = filter.condition.caseSensitive ? filter.condition.value : filter.condition.value.toLowerCase();
          const result = s1[filter.condition.type](s2);
          if (result !== filter.condition.invert) {
            return true;
          }
        } else {
          const regex = new RegExp(filter.condition.value, filter.condition.caseSensitive ? '' : 'i');
          const result = regex.test(compStr);
          if (result !== filter.condition.invert) {
            return true;
          }
        }
      }
    }
  }
  return false;
}
