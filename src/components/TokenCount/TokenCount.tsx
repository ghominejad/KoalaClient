import React, { useEffect, useMemo, useState } from 'react';
import useStore from '@store/store';
import { shallow } from 'zustand/shallow';
import { tokenCostToCost } from '@utils/messageUtils';

import countTokens from '@utils/messageUtils';
import { MessageInterface } from '@type/chat';

const TokenCount = React.memo(() => {
  const [updateOverride, setUpdateOverride] = useState(true);
  const [tokenCount, setTokenCount] = useState<number>(0);
  const [assistantTokenCount, setAssistantTokenCount] = useState<number>(0);
  const [userTokenCount, setUserTokenCount] = useState<number>(0);

  const generating = useStore((state) => state.generating);
  const messages = useStore(
    (state) =>
      state.chats ? state.chats[state.currentChatIndex].messages : [],
    shallow
  );

  const modelDefs = useStore((state) => state.modelDefs);

  const model_num = useStore((state) => {
    const currentModelNum =
      state.chats?.[state.currentChatIndex]?.config?.model_selection ?? 0;
    return currentModelNum >= modelDefs.length ? 0 : currentModelNum;
  });

  const model = useStore((state) => state.modelDefs[model_num]);
  // const price = model.prompt_cost_1000 * (tokenCount / 1_000_000);
  var assistantMessages = messages.filter(m=>m.role=="assistant") 
  var userMessages = messages.filter(m=>m.role!="assistant") 

  const cost = useMemo(() => {
    if (!model?.prompt_cost_1000) {
      return 0;
    }

    // messages[0].role
    var tokenCost :any=    
    { promptTokens: userTokenCount,
    completionTokens: assistantTokenCount
    }
    const price =  tokenCostToCost(tokenCost, model_num, modelDefs);


    return price.toPrecision(3);
  }, [model, tokenCount]);

  useEffect(() => {
    if (!generating || updateOverride) {
      setUpdateOverride(!generating);
      setTokenCount(countTokens(messages, model.model));
      setAssistantTokenCount(countTokens(assistantMessages, model.model));
      setUserTokenCount(countTokens(userMessages, model.model));

    }
  }, [messages, generating]);

  return (
    <div className='absolute top-[-16px] right-0'>
      <div style={{"gap": "0.5rem",     "display": "flex"}} className='text-xs italic text-custom-white'>
        Tokens: {userTokenCount}<svg style={{"width": "1rem"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-slot="icon" className="w-4"><path fill-rule="evenodd" d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"></path></svg>{assistantTokenCount} (${cost})
      </div>
    </div>
  );
});

export default TokenCount;
