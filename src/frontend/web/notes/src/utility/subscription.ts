import {Subscription} from "rxjs";

export function unsubscribe(s: Subscription): () => void {
    return () => { s.unsubscribe(); }
}