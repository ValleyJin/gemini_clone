const container = document.querySelector(".container")

// 채팅창 전체를 감싸는 .chats-container 클래스 가진 요소 중 첫 번째를 찾음
const chatsContainer = document.querySelector(".chats-container")
// 사용자의 입력창인 .prompt-input 클래스를 가진 요소 중 첫 번째를 찾음
const promptForm = document.querySelector(".prompt-form");
// .prompt-form 클래스를 가진 요소 안에서 .prompt-Input 클래스를 가진 첫 번째 요소를 찾음
// 전체 document에서 찾는 것보다는 하위요소인 promptForm에서 차는 것이 더 빠르고, 번지수가 한 눈에 보임.
const promptInput = promptForm.querySelector(".prompt-input");

// .env 파일에서 API 키를 가져옴 (실 서비스에서는 .env 파일을 사용하여 환경변수를 관리)
// 실제 서비스시에는 키를 노출하면 안되므로, 아래의 API_KEY 코드는 삭제해야 함
// 해결책: supabase의 edge function이나 AWS의 lambda와 같은 서버리스 함수의 환경변수로 API 키 저장
// 이들이 서버의 프록시을 하면서 고객의 호출을 가로채서 응답은 하되, 키를 노출하지 않음
const API_KEY = "AIzaSyDH8QEHnbmcol0Om22D1M90iZMGHcPzflo";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

// 사용자의 입력과 bot의 대답을 저장하는 배열: 초기화 
let userMessage = "";
const chatHistory = [];

// div로 감싸서 빈껍데기 응답요소를 생성
// 수집: 나머지 매개변수(...)는 함수 매개변수에서 나머지 인수들을 배열로 수집
const createMsgElement = (html, ...classes) => {     
    // div 태그를 dom 객체로 생성한다. 
    const div = document.createElement("div");
    // div 태그의 클래스 이름으로 message 및 추가적인 클래스인 ...classes를 추가한다.  
    // 전개: Spread Operator (전개 연산자 ...)를 사용하여 배열을 펼쳐서 각각의 요소를 전달
    div.classList.add("message",...classes);
    // div 태그안에 자식요소로 html 컨텐츠를 추가한다.
    div.innerHTML = html;
    return div;
}

// 화면전체(즉, container 클래스)의 스크롤을 최하단으로 내리는 함수
const scrollToBottom = () => {
    // scrollTop: 위에서 부터 얼마나 스크롤했는지(=scroll from top의 개념). 픽셀 값으로 측정. 스크롤 내리면 증가.
    // scrollTop을 scrollHeight로 맞추면 스크롤을 최하단으로 내린 상태가 됨
    // 대화가 증가할수록 scrollHeight도 증가하므로, 대화에 맞춰 스크롤을 계속 최하단으로 내리는 효과가 발생
    console.log('스크롤 시도:', container.scrollHeight, container.scrollTop);
    container.scrollTo({top: container.scrollHeight, behavior: "smooth"});
};
 
// 타이핑 효과 적용 
const typingEffect = (html, textElement, botMsgDiv) => {
    textElement.innerHTML = ""; 

    // 전처리: html 컨텐츠를 단어 단위로 분리 (공백을 기준으로) -> 배열로 저장
    const words = html.split(" "); 
    // 배열의 인덱스 0으로 초기화
    let wordIndex = 0;

    // 40ms 마다 한 단어씩만 출력하도록 설정
    // 인터벌마다 반복적 실행을 위해 setInterval 함수 사용 
    const typingInterval = setInterval(() => {
        if(wordIndex < words.length){
            // 공백 처리: 첫 단어는 공백 없이 출력하고, 나머지는 공백을 줘서 단어들을 연결
            textElement.innerHTML += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
            scrollToBottom();        
        } else { 
            clearInterval(typingInterval);  
            // .bot-message.loading .avartar 클래스에 회전 애니메이션이 걸려 있으므로, 여기에서 .loading 클래스만 제거해도 회전이 멈춥니다.
            botMsgDiv.classList.remove("loading");
        }
    }, 100);  

};

// 질문, 응답을 한방에 실행
const generateResponse = async (botMsgDiv) => {

    //**************************************************
    //            1. 질문 --> Gemini API 전송            *
    //**************************************************

    // 응답이 담겨있는 botMsgDiv 안에서 응답을 추출하여 history에 저장하고, 
    // 이를  Gemini API에 전송하여, 그간의 대화 맥락에 충실한 응답을 받아 텍스트를 화면에 출력

    // message-text 클래스를 가진 p태그 영역이 응답이 들어있는 장소임    
    const textElement = botMsgDiv.querySelector(".message-text");
    // REST API는 stateless하므로, 지나간 대화내역에 지금의 대화를 함께 저장
    // 화자는 role, 대화내용은 parts안에 text키값에 대응하는 객체형태로 대화내용을 저장
    chatHistory.push({
        role: "user", 
        parts: [{text: userMessage}]
    });

    // 그간의 대화와 지금의 질문이 모인 chatHistory를 Gemini API에 전송
    // 비동기 처리에는 try-catch문을 사용하여 에러처리를 명확히 한다. 
    try {
        // fetch: API 요청을 보내는 함수. 첫 번째 인자: url (string)
        // 두 번째 인자: options (HTTP 요청 초기화 객체인 RequestInit 객체: 선택사항)
        const response = await fetch(API_URL, {
            method: "POST",
            // Rest API는 HTTP 메서드를 사용하여 요청을 하므로, header가 필요하다.
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({contents: chatHistory}),
        });
        // 응답 데이터를 JSON 형식으로 역직렬화
        const data = await response.json();
        // 응답 상태가 성공이 아니면 에러 메시지를 출력
        if(!response.ok) throw new Error(data.error.message);
        // 응답 데이터 객체를 콘솔에 출력
        console.log(data);

        //**************************************************
        //      2. Gemini API 답변 수신 --> 마크다운 변환        *
        //**************************************************

        // 응답 데이터 객체에서 봇의 "대답"(원문 텍스트) 추출 
        // - 객체 안의 parts[0].text에 저장되어 있음
        // - 응답은 마크다운(md) 문법을 포함할 수 있으므로, 정규식으로 HTML로 변환
        // - 특히 트리플 백틱(코드블록)과 싱글 백틱(인라인 코드)을 먼저/나중 순서로 안전 처리

        // 0) 원문 텍스트 확보
        const originalText = data.candidates[0].content.parts[0].text;

        // 0.5) HTML 태그 이스케이프 처리 (마크다운 변환 전에)
        const htmlEscapedText = originalText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // 1) 코드블록(트리플 백틱 ``` ... ``` )을 먼저 보존
        //    - 다른 변환에서 영향을 받지 않도록 플레이스홀더로 치환했다가, 마지막에 복원
        const codeBlocks = [];
        // 언어 표시가 있는 코드블록도 허용: ```js\n...```, ```javascript\n...```
        let tmpText = htmlEscapedText.replace(/```(?:([a-zA-Z0-9_-]+)\n)?([\s\S]*?)```/g, (_, lang, code) => {
            const token = `__CODE_BLOCK_${codeBlocks.length}__`;
            // Prism 하이라이트: class="language-xxx" 필요
            const language = (lang || "javascript").toLowerCase();
            // 코드는 이미 이스케이프 처리됨
            codeBlocks.push(`<pre><code class=\"language-${language}\">${code || ""}</code></pre>`);
            return token;
        });

        // 2) 마크다운 일반 텍스트 변환 (헤딩/강조/목록/구분선/줄바꿈 등)
        tmpText = tmpText
            // 강조
            .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")  // **굵은글씨**
            .replace(/\*([^*]+)\*/g, "<em>$1</em>")              // *기울임*
            // 헤딩 (#### → # 순으로 처리)
            .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
            .replace(/^### (.+)$/gm, "<h3>$1</h3>")
            .replace(/^## (.+)$/gm, "<h2>$1</h2>")
            .replace(/^# (.+)$/gm, "<h1>$1</h1>")
            // 목록: 적절한 간격으로 변환
            .replace(/^[\s]*[-*]\s+(.+)$/gm, '<div class="list-item">• $1</div>')  // - 또는 * 목록
            .replace(/^[\s]*(\d+)[\.\)]\s+(.+)$/gm, '<div class="numbered-item"><span class="number">$1.</span><span class="content">$2</span></div>')  // 숫자 목록
            // 구분선
            .replace(/^[\s]*---+[\s]*$/gm, "<hr>")
            // 줄바꿈(윈도우/맥/리눅스 개행 모두 대응)
            .replace(/\r\n|\r|\n\n/g, "<br><br>")
            .replace(/\n/g, "<br>")
            .trim();

        // 3) 인라인 코드(싱글 백틱 `code`) 처리 - 일반 텍스트 변환 이후에 적용
        tmpText = tmpText.replace(/`([^`]+)`/g, (_, code) => {
            // 코드는 이미 이스케이프 처리됨
            return `<code>${code}</code>`;
        });

        // 4) 1)에서 보존한 코드블록 플레이스홀더 복원
        codeBlocks.forEach((html, i) => {
            tmpText = tmpText.replace(`__CODE_BLOCK_${i}__`, html);
        });

        // 4.5) 보안상 기본 이스케이프는 유지하되, 안전하다고 판단한 일부 태그는 화이트리스트로 복원
        // 모델이 직접 출력한 <strong>, <em>, <br>, <hr> 태그가 텍스트로 노출되는 문제를 해결
        tmpText = tmpText
            .replace(/&lt;\/?strong&gt;/g, (m) => m.replace('&lt;', '<').replace('&gt;', '>'))
            .replace(/&lt;\/?em&gt;/g, (m) => m.replace('&lt;', '<').replace('&gt;', '>'))
            .replace(/&lt;br\s*\/?&gt;/g, '<br>')
            .replace(/&lt;hr\s*\/?&gt;/g, '<hr>');

        const responseText = tmpText;

            // 타이핑 효과 적용
            // 주의: 코드블록/인라인 코드가 포함된 경우에는 태그가 깨지지 않도록
            // 타이핑 효과를 건너뛰고 한 번에 렌더링한다.
            // 코드블록(<pre>)이 있을 때만 타이핑을 생략하고 즉시 렌더링
            // 인라인 코드(<code>)만 있는 경우에는 타이핑을 유지
            if (/<pre/.test(responseText)) {
                textElement.innerHTML = responseText;
                // 코드블록 즉시 렌더링 시에도 스크롤을 최하단으로 이동
                scrollToBottom();
                botMsgDiv.classList.remove("loading");
                // Prism.js가 로드되어 있다면 블록 내부 하이라이트 실행
                if (window.Prism && typeof window.Prism.highlightAllUnder === "function") {
                    window.Prism.highlightAllUnder(botMsgDiv);
                }
                // 하이라이트 이후에도 스크롤을 최하단으로 이동
                scrollToBottom();
            } else {
                // (텍스트 전용) 타이핑 연출. 스크롤 하단으로 이동효과 포함
                typingEffect(responseText, textElement, botMsgDiv);
            }
             

            // bot의 대답인 responseText --> chatHistory에 저장
            chatHistory.push({
                role: "model", 
                parts: [{text: responseText}]
            });

    }
    catch(error){
        console.error(error);
    }
}

// 대화창에 사용자의 입력과 bot의 대답을 HTML로 생성하는 이벤트 핸들러 콜백함수
const handleFormsubmit = (e) => {
    //**************************************************
    //          1. 사용자의 질문 --> 대화창에 생성            *
    //**************************************************
    // 이벤트 객체마다 정해진 기본동작의 실행을 막는 메서드(여기서는 submit 버튼을 눌렀을 때 폼 제출이 되는 것을 막음)
    e.preventDefault();
    // prompt창에 입력한 사용자의 대화입력을 공백을 제거한 후 대화창에서도 보여줘야 하므로 저장
    // promptInput은 DOM 객체이므로 value 속성을 사용하여 값을 가져옴
    userMessage = promptInput.value.trim();
    // 사용자의 입력이 없으면 함수의 빠른 종료 (!를 이용해서 false일 때 실행)
    if(!userMessage) return;

    // promptInput은 userMessage에 저장 후 초기화
    promptInput.value = "";
 
    // 대화전체를 품고 있는 p태그 구현 (클래스: message-text)
    const userMsgHTML = `<p class="message-text"></p>`;
    // p태그를 감싸는 상위 div 태그 구현(클래스: user-message)
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");
    // prompt창에 입력한 사용자의 대화입력을 추가하여 완성
    userMsgDiv.querySelector(".message-text").textContent = userMessage;
    // 대화창 맨 아래에 나타나도록 추가
    chatsContainer.appendChild(userMsgDiv);
    // 화면 최하단으로 스크롤
    scrollToBottom();

    //**************************************************
    //          2. bot의 대답 --> 대화창에 생성             *
    //**************************************************
    // Just a sec…”, 스피너가 확실히 페인트된 뒤 fetch 시작하려고 600ms 대기
    setTimeout(() => {
        // 대화전체를 품고 있는 p태그 구현 (클래스: message-text)
        const botMsgHTML = `<img src="gemini.svg" alt="" class="avartar"><p class="message-text">Just a sec...</p>`;
        // p태그를 감싸는 상위 div 태그 구현(클래스: bot-message와 loading)
        const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
        // 빈껍데기 대화 html요소를 추가하여 사용자의 새로운 입력을 받을 준비를 완료
        chatsContainer.appendChild(botMsgDiv); 
        // 빈껍데기 대화 html요소에 대답 텍스트를 추가하여 질문+응답을 한방에 실행
        generateResponse(botMsgDiv); 
    }, 600)
}


// 이벤트 리스너에 아밴투핸들러 콜백함수를 등록 
promptForm.addEventListener("submit", handleFormsubmit);