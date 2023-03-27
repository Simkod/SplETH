import './Loader.css'

export default function Loader({ height }: { height?: number }) {
    return (
        <div className='lds-ellipsis' style={{ height: height }}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    )
}
