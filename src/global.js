import { useStorage } from "@vueuse/core";
import _ from "lodash";
import {generateID} from "./shared/random";
import {LocalHost} from "./api/backend/local";
import {LocalStorage} from "./api/backend/storage";


const global = useStorage("note-test", null, undefined,{
    serializer: {
        read: (v) => (v ? JSON.parse(v) : ""),
        write: (v) => JSON.stringify(v),
    },
});

const _global = {
    note: {
        id: generateID(),
        title: "Note Title",
        content: `
            <h1>H1</h1>
            <p>In order to receive the best answers to your questions please follow these simple guidelines.</p>
            <p>Be descriptive about your question or problem and be sure to include any errors. Single line topics will rarely receive answers and do not just post a screenshot.</p>
            
            <h1>H1</h1>
            <p>Be specific about which version of Vue and its related plugins you’re using. Link to any 3rd party libs/plugins that relate to your question.</p>
            <p>Provide examples of the code in question and use syntax highlighting.</p>
            
            <h1>H1</h1>
            <p>Breakdown the issue in your code and provide a link to an example that replicates it. Use JSFiddle, CodePen, CodeSandbox, Stackblitz, or the Vue SFC Playground.</p>
            <p>Following these few steps will greatly improve your chances of getting a good quality answer to your issue. Remember, everyone is here to share ideas and to help out using their own free time. Making an effort to craft a well thought out topic pays tribute to this.</p>
        `,
        annotations: [],
    },
    backend: new LocalStorage()

};

(() => {
    if (global.value) {
        global.value = _.merge(_global, global.value);
    } else {
        global.value = _global;
    }
})();

export default global;