interface AvatarProps {
  name: string
  imageUrl?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
}

const colors = [
  'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-blue-500',
  'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500',
]

const getColor = (name: string) => colors[name.charCodeAt(0) % colors.length]

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

const Avatar: React.FC<AvatarProps> = ({ name, imageUrl, size = 'md' }) => {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover`}
      />
    )
  }
  return (
    <div
      className={`${sizes[size]} ${getColor(name)} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  )
}

export default Avatar
