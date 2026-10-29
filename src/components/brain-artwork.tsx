import { useId } from 'react'
import { heroPhoto } from '@/lib/hero-artwork'

// Hand-drawn superior/frontal study: the lobulated outer cortex and continuous
// sulci share a central fissure. Each gyrus has its own future motion wrapper.
const silhouette =
  'M291 82 C281 51 247 51 226 68 C202 57 173 75 162 96 C134 94 112 116 111 141 C84 152 74 179 83 202 C61 225 65 254 77 272 C57 299 69 332 85 346 C76 376 93 403 112 411 C111 443 138 463 159 462 C171 490 203 501 227 491 C249 519 280 509 289 487 C301 454 285 421 294 388 C301 357 289 328 295 296 C301 268 290 241 296 212 C301 179 287 158 294 131 C298 111 297 94 291 82 Z'
const folds = [
  'M276 81 C251 69 240 88 245 109 C250 132 276 131 276 152 C278 171 258 180 263 200',
  'M224 88 C200 77 180 98 189 119 C198 138 228 127 229 150 C232 169 207 178 216 197 C225 217 255 211 269 228',
  'M165 115 C140 109 124 135 139 154 C151 169 176 153 181 176 C186 198 157 201 159 223',
  'M113 171 C89 188 108 213 126 216 C145 219 151 239 138 250 C122 262 100 242 93 262',
  'M192 211 C175 228 180 250 200 256 C221 263 242 244 259 256 C278 267 273 284 252 290',
  'M104 286 C83 297 96 321 116 321 C142 318 149 289 170 289 C191 289 194 310 181 326 C168 344 142 337 137 357',
  'M224 286 C204 306 222 323 246 323 C272 323 278 343 261 359 C246 372 226 353 210 368',
  'M103 351 C98 374 118 388 139 382 C163 375 177 383 174 405 C170 423 143 416 139 437',
  'M195 345 C179 362 187 384 205 395 C229 408 250 387 269 401',
  'M183 439 C191 416 217 428 218 449 C217 474 243 493 266 479 C284 465 264 447 250 447 C235 447 240 426 268 427',
]

export function BrainArtwork() {
  const id = useId().replace(/:/g, '')
  const url = (name: string) => `url(#${id}-${name})`
  return (
    <svg aria-hidden="true" focusable="false" className="brain-artwork" viewBox="0 0 600 580">
      <defs>
        <linearGradient id={`${id}-graphite`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#727b86" />
          <stop offset=".35" stopColor="#363e48" />
          <stop offset="1" stopColor="#171b22" />
        </linearGradient>
        <linearGradient id={`${id}-warm`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f4c49a" />
          <stop offset=".48" stopColor="#bf795e" />
          <stop offset="1" stopColor="#693d57" />
        </linearGradient>
        <linearGradient id={`${id}-ridge`} x1="0" y1="0" x2=".8" y2="1">
          <stop stopColor="#a3aab0" stopOpacity=".6" />
          <stop offset=".4" stopColor="#505b68" />
          <stop offset="1" stopColor="#242b34" />
        </linearGradient>
        <linearGradient id={`${id}-colour`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffb963" />
          <stop offset=".5" stopColor="#d95d39" />
          <stop offset="1" stopColor="#82375e" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-40%" y="-30%" width="180%" height="180%">
          <feDropShadow dx="0" dy="16" stdDeviation="15" floodColor="#080c12" floodOpacity=".3" />
        </filter>
        <filter id={`${id}-fragment-shadow`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="1" dy="5" stdDeviation="4" floodColor="#241b25" floodOpacity=".4" />
        </filter>
        <pattern
          id={`${id}-forest`}
          patternUnits="userSpaceOnUse"
          x="300"
          y="90"
          width="230"
          height="340"
        >
          <image
            href={heroPhoto.src}
            x="0"
            y="0"
            width="230"
            height="340"
            preserveAspectRatio="xMidYMid slice"
          />
        </pattern>
      </defs>
      <g data-brain-shadow opacity=".12">
        <ellipse cx="300" cy="532" rx="138" ry="9" fill="currentColor" />
      </g>
      <g filter={url('shadow')}>
        <g data-hemisphere="technical">
          <path
            d={silhouette}
            fill={url('graphite')}
            stroke="#88929f"
            strokeOpacity=".45"
            strokeWidth="1.5"
          />
          {folds.map((d, index) => (
            <g key={d} data-fragment={`technical-${index}`}>
              <path d={d} fill="none" stroke="#10151d" strokeWidth="28" strokeLinecap="round" />
              <path
                d={d}
                fill="none"
                stroke={url('ridge')}
                strokeWidth="22"
                strokeLinecap="round"
                transform="translate(-1 -2)"
              />
              <path
                d={d}
                fill="none"
                stroke="#a1b6cf"
                strokeOpacity=".23"
                strokeWidth="1"
                transform="translate(-4 -7)"
              />
            </g>
          ))}
          <g
            fill="none"
            stroke="var(--technical-accent)"
            strokeWidth="1.5"
            opacity=".7"
            data-brain-contours
          >
            <path d="M224 88 C200 77 180 98 189 119 C198 138 228 127 229 150" />
            <path d="M104 286 C83 297 96 321 116 321 C142 318 149 289 170 289" />
            <path d="M195 345 C179 362 187 384 205 395 C229 408 250 387 269 401" />
          </g>
        </g>
        <g data-hemisphere="creative">
          <g transform="translate(600 0) scale(-1 1)">
            <path d={silhouette} fill={url('warm')} stroke="#e2bba0" strokeWidth="1.5" />
            {folds.map((d, index) => (
              <g key={d} data-fragment={`creative-${index}`}>
                <path d={d} fill="none" stroke="#683d45" strokeWidth="28" strokeLinecap="round" />
                <path
                  d={d}
                  fill="none"
                  stroke={url('colour')}
                  strokeWidth="23"
                  strokeLinecap="round"
                  transform="translate(-1 -2)"
                />
                <path
                  d={d}
                  fill="none"
                  stroke="#ffe3b4"
                  strokeOpacity=".45"
                  strokeWidth="1.4"
                  transform="translate(-4 -8)"
                />
              </g>
            ))}
          </g>
          <g filter={url('fragment-shadow')}>
            <g data-fragment="photo-crown">
              <path
                d="M340 93 C356 67 390 75 410 100 C431 107 445 130 437 152 C415 167 398 146 382 150 C355 156 365 127 350 120 C342 116 336 103 340 93Z"
                fill={url('forest')}
                stroke="#e9c9a1"
                strokeWidth="2"
              />
            </g>
            <g data-fragment="photo-temporal">
              <path
                d="M453 192 C476 168 510 174 526 198 C542 224 526 252 509 265 C493 278 479 303 459 295 C443 288 453 269 439 254 C425 237 433 216 453 192Z"
                fill={url('forest')}
                stroke="#dbd3a8"
                strokeWidth="2"
              />
            </g>
            <g data-fragment="photo-lower">
              <path
                d="M357 331 C379 311 413 326 430 346 C446 369 432 388 446 408 C455 428 433 454 413 448 C397 437 385 445 369 426 C356 410 376 393 363 376 C349 360 345 344 357 331Z"
                fill={url('forest')}
                stroke="#c4bf92"
                strokeWidth="2"
              />
            </g>
            <g data-fragment="colour-ribbon">
              <path
                d="M436 147 C465 133 490 150 485 174 C482 191 460 202 468 220"
                fill="none"
                stroke="#168a89"
                strokeWidth="18"
                strokeLinecap="round"
              />
              <path
                d="M439 142 C465 133 483 147 480 165"
                fill="none"
                stroke="#a4d6bd"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          </g>
        </g>
        <path
          data-brain-seam
          d="M300 83 C305 123 295 153 302 187 C307 223 297 255 301 291 C307 325 295 355 301 388 C306 425 297 456 300 486"
          fill="none"
          stroke="#0f141a"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}
