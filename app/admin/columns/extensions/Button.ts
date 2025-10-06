import { Node, mergeAttributes } from '@tiptap/core'

export interface ButtonOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    button: {
      /**
       * Insert a button
       */
      insertButton: (options: { text: string; url: string; style?: string }) => ReturnType
    }
  }
}

export const Button = Node.create<ButtonOptions>({
  name: 'button',

  group: 'block',

  content: '',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      text: {
        default: 'ボタン',
        parseHTML: element => element.getAttribute('data-text'),
        renderHTML: attributes => {
          if (!attributes.text) {
            return {}
          }
          return {
            'data-text': attributes.text,
          }
        },
      },
      url: {
        default: '',
        parseHTML: element => element.getAttribute('data-url'),
        renderHTML: attributes => {
          if (!attributes.url) {
            return {}
          }
          return {
            'data-url': attributes.url,
          }
        },
      },
      style: {
        default: 'primary',
        parseHTML: element => element.getAttribute('data-style'),
        renderHTML: attributes => {
          if (!attributes.style) {
            return {}
          }
          return {
            'data-style': attributes.style,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="button"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const { text, url, style } = node.attrs

    const getButtonClass = (style: string) => {
      switch(style) {
        case 'secondary':
          return 'btn-secondary'
        case 'outline':
          return 'btn-outline'
        default:
          return 'btn-primary'
      }
    }

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'button',
        'data-text': text,
        'data-url': url,
        'data-style': style,
        class: 'button-component',
      }),
      [
        'a',
        {
          href: url,
          target: '_blank',
          rel: 'noopener noreferrer',
          class: getButtonClass(style),
        },
        text,
      ],
    ]
  },

  addCommands() {
    return {
      insertButton:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      // Skip node view on server side
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return null
      }

      const container = document.createElement('div')
      container.className = 'button-component my-4'
      container.setAttribute('data-type', 'button')
      container.setAttribute('data-text', node.attrs.text)
      container.setAttribute('data-url', node.attrs.url)
      container.setAttribute('data-style', node.attrs.style)

      const button = document.createElement('button')
      button.className = `inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer ${
        node.attrs.style === 'secondary' 
          ? 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200' 
          : node.attrs.style === 'outline'
          ? 'bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`
      button.textContent = node.attrs.text
      button.contentEditable = 'false'

      // Add click handler for editing
      button.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        // Trigger custom event to open edit modal
        const customEvent = new CustomEvent('editButton', {
          detail: {
            node,
            pos: typeof getPos === 'function' ? getPos() : getPos,
            editor
          }
        })
        document.dispatchEvent(customEvent)
      })

      container.appendChild(button)

      return {
        dom: container,
        contentDOM: null,
      }
    }
  },
})

export default Button