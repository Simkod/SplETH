import React from 'react';

export class EmojiProps {
    symbol: string = '';
    label?: string = '';
    size?: string = '22px';
}

export default function Emoji(props: EmojiProps) {
    return (
        <span
            className="emoji"
            role="img"
            aria-label={props.label ?? ''}
            aria-hidden={props.label ? "false" : "true"}
            style={{ fontSize: props.size, padding: '2px 5px' }}
        >
            {props.symbol}
        </span>
    )
}
