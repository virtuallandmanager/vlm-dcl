import { Color4 } from '@dcl/sdk/math';
import { ecs } from '../environment';
export var VLMNotification;
(function (VLMNotification) {
    class Message {
        constructor(_value, _messageOptions) {
            this.vAlign = 'center';
            this.hAlign = 'center';
            this.fontSize = 32;
            this.color = Color4.White();
            this.delay = 3;
            this.adaptWidth = true;
            this.adaptHeight = true;
            this.opacity = 0;
            this.fadeSpeed = 1;
            this.value = '';
            this.init = (value, messageOptions) => {
                let canvas = ecs.UiCanvasInformation.get(ecs.engine.RootEntity), proportionalFontSize = Math.ceil(canvas.width / 50) < 12 ? 12 : Math.ceil(canvas.width / 50);
                const color = messageOptions?.color || 'white', fontSize = messageOptions?.fontSize;
                this.delay = messageOptions?.delay || this.delay;
                this.fadeSpeed = messageOptions?.fadeSpeed || this.fadeSpeed;
                this.value = value;
                this.fontSize = fontSize || proportionalFontSize;
                if (!color) {
                    return;
                }
                switch (color.toLowerCase()) {
                    case 'black':
                        this.color = Color4.Black();
                        break;
                    case 'blue':
                        this.color = Color4.Blue();
                        break;
                    case 'gray':
                        this.color = Color4.Gray();
                        break;
                    case 'green':
                        this.color = Color4.Green();
                        break;
                    case 'magenta':
                        this.color = Color4.Magenta();
                        break;
                    case 'purple':
                        this.color = Color4.Purple();
                        break;
                    case 'red':
                        this.color = Color4.Red();
                        break;
                    case 'teal':
                        this.color = Color4.Teal();
                        break;
                    case 'yellow':
                        this.color = Color4.Yellow();
                        break;
                    case 'white':
                    default:
                        this.color = Color4.White();
                }
            };
            this.init(_value, _messageOptions);
        }
    }
    VLMNotification.Message = Message;
})(VLMNotification || (VLMNotification = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkxNTm90aWZpY2F0aW9uLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL1ZMTU5vdGlmaWNhdGlvbi5jb21wb25lbnQudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUE7QUFFdEMsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBRXBDLE1BQU0sS0FBVyxlQUFlLENBc0UvQjtBQXRFRCxXQUFpQixlQUFlO0lBQzlCLE1BQWEsT0FBTztRQVlsQixZQUFZLE1BQWMsRUFBRSxlQUFnQztZQVg1RCxXQUFNLEdBQVcsUUFBUSxDQUFBO1lBQ3pCLFdBQU0sR0FBVyxRQUFRLENBQUE7WUFDekIsYUFBUSxHQUFXLEVBQUUsQ0FBQTtZQUNyQixVQUFLLEdBQVcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFBO1lBQzlCLFVBQUssR0FBVyxDQUFDLENBQUE7WUFDakIsZUFBVSxHQUFZLElBQUksQ0FBQTtZQUMxQixnQkFBVyxHQUFZLElBQUksQ0FBQTtZQUMzQixZQUFPLEdBQVcsQ0FBQyxDQUFBO1lBQ25CLGNBQVMsR0FBVyxDQUFDLENBQUE7WUFDckIsVUFBSyxHQUFXLEVBQUUsQ0FBQTtZQU1sQixTQUFJLEdBQXFCLENBQUMsS0FBYSxFQUFFLGNBQStCLEVBQUUsRUFBRTtnQkFDMUUsSUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUM3RCxvQkFBb0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQTtnQkFDOUYsTUFBTSxLQUFLLEdBQUcsY0FBYyxFQUFFLEtBQUssSUFBSSxPQUFPLEVBQzVDLFFBQVEsR0FBRyxjQUFjLEVBQUUsUUFBUSxDQUFBO2dCQUNyQyxJQUFJLENBQUMsS0FBSyxHQUFHLGNBQWMsRUFBRSxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQTtnQkFDaEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxjQUFjLEVBQUUsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUE7Z0JBQzVELElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO2dCQUNsQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsSUFBSSxvQkFBb0IsQ0FBQTtnQkFDaEQsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNYLE9BQU07Z0JBQ1IsQ0FBQztnQkFDRCxRQUFRLEtBQUssQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDO29CQUM1QixLQUFLLE9BQU87d0JBQ1YsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUE7d0JBQzNCLE1BQUs7b0JBQ1AsS0FBSyxNQUFNO3dCQUNULElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO3dCQUMxQixNQUFLO29CQUNQLEtBQUssTUFBTTt3QkFDVCxJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQTt3QkFDMUIsTUFBSztvQkFDUCxLQUFLLE9BQU87d0JBQ1YsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUE7d0JBQzNCLE1BQUs7b0JBQ1AsS0FBSyxTQUFTO3dCQUNaLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFBO3dCQUM3QixNQUFLO29CQUNQLEtBQUssUUFBUTt3QkFDWCxJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQTt3QkFDNUIsTUFBSztvQkFDUCxLQUFLLEtBQUs7d0JBQ1IsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUE7d0JBQ3pCLE1BQUs7b0JBQ1AsS0FBSyxNQUFNO3dCQUNULElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO3dCQUMxQixNQUFLO29CQUNQLEtBQUssUUFBUTt3QkFDWCxJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQTt3QkFDNUIsTUFBSztvQkFDUCxLQUFLLE9BQU8sQ0FBQztvQkFDYjt3QkFDRSxJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQTtnQkFDL0IsQ0FBQztZQUNILENBQUMsQ0FBQTtZQS9DQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQTtRQUNwQyxDQUFDO0tBK0NGO0lBN0RZLHVCQUFPLFVBNkRuQixDQUFBO0FBUUgsQ0FBQyxFQXRFZ0IsZUFBZSxLQUFmLGVBQWUsUUFzRS9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29sb3I0IH0gZnJvbSAnQGRjbC9zZGsvbWF0aCdcclxuaW1wb3J0IHsgVWlDYW52YXNJbmZvcm1hdGlvbiwgZW5naW5lIH0gZnJvbSAnQGRjbC9zZGsvZWNzJ1xyXG5pbXBvcnQgeyBlY3MgfSBmcm9tICcuLi9lbnZpcm9ubWVudCdcclxuXHJcbmV4cG9ydCBuYW1lc3BhY2UgVkxNTm90aWZpY2F0aW9uIHtcclxuICBleHBvcnQgY2xhc3MgTWVzc2FnZSB7XHJcbiAgICB2QWxpZ246IHN0cmluZyA9ICdjZW50ZXInXHJcbiAgICBoQWxpZ246IHN0cmluZyA9ICdjZW50ZXInXHJcbiAgICBmb250U2l6ZTogbnVtYmVyID0gMzJcclxuICAgIGNvbG9yOiBDb2xvcjQgPSBDb2xvcjQuV2hpdGUoKVxyXG4gICAgZGVsYXk6IG51bWJlciA9IDNcclxuICAgIGFkYXB0V2lkdGg6IGJvb2xlYW4gPSB0cnVlXHJcbiAgICBhZGFwdEhlaWdodDogYm9vbGVhbiA9IHRydWVcclxuICAgIG9wYWNpdHk6IG51bWJlciA9IDBcclxuICAgIGZhZGVTcGVlZDogbnVtYmVyID0gMVxyXG4gICAgdmFsdWU6IHN0cmluZyA9ICcnXHJcblxyXG4gICAgY29uc3RydWN0b3IoX3ZhbHVlOiBzdHJpbmcsIF9tZXNzYWdlT3B0aW9ucz86IE1lc3NhZ2VPcHRpb25zKSB7XHJcbiAgICAgIHRoaXMuaW5pdChfdmFsdWUsIF9tZXNzYWdlT3B0aW9ucylcclxuICAgIH1cclxuXHJcbiAgICBpbml0OiBDYWxsYWJsZUZ1bmN0aW9uID0gKHZhbHVlOiBzdHJpbmcsIG1lc3NhZ2VPcHRpb25zPzogTWVzc2FnZU9wdGlvbnMpID0+IHtcclxuICAgICAgbGV0IGNhbnZhcyA9IGVjcy5VaUNhbnZhc0luZm9ybWF0aW9uLmdldChlY3MuZW5naW5lLlJvb3RFbnRpdHkpLFxyXG4gICAgICAgIHByb3BvcnRpb25hbEZvbnRTaXplID0gTWF0aC5jZWlsKGNhbnZhcy53aWR0aCAvIDUwKSA8IDEyID8gMTIgOiBNYXRoLmNlaWwoY2FudmFzLndpZHRoIC8gNTApXHJcbiAgICAgIGNvbnN0IGNvbG9yID0gbWVzc2FnZU9wdGlvbnM/LmNvbG9yIHx8ICd3aGl0ZScsXHJcbiAgICAgICAgZm9udFNpemUgPSBtZXNzYWdlT3B0aW9ucz8uZm9udFNpemVcclxuICAgICAgdGhpcy5kZWxheSA9IG1lc3NhZ2VPcHRpb25zPy5kZWxheSB8fCB0aGlzLmRlbGF5XHJcbiAgICAgIHRoaXMuZmFkZVNwZWVkID0gbWVzc2FnZU9wdGlvbnM/LmZhZGVTcGVlZCB8fCB0aGlzLmZhZGVTcGVlZFxyXG4gICAgICB0aGlzLnZhbHVlID0gdmFsdWVcclxuICAgICAgdGhpcy5mb250U2l6ZSA9IGZvbnRTaXplIHx8IHByb3BvcnRpb25hbEZvbnRTaXplXHJcbiAgICAgIGlmICghY29sb3IpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG4gICAgICBzd2l0Y2ggKGNvbG9yLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgICBjYXNlICdibGFjayc6XHJcbiAgICAgICAgICB0aGlzLmNvbG9yID0gQ29sb3I0LkJsYWNrKClcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnYmx1ZSc6XHJcbiAgICAgICAgICB0aGlzLmNvbG9yID0gQ29sb3I0LkJsdWUoKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdncmF5JzpcclxuICAgICAgICAgIHRoaXMuY29sb3IgPSBDb2xvcjQuR3JheSgpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ2dyZWVuJzpcclxuICAgICAgICAgIHRoaXMuY29sb3IgPSBDb2xvcjQuR3JlZW4oKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBjYXNlICdtYWdlbnRhJzpcclxuICAgICAgICAgIHRoaXMuY29sb3IgPSBDb2xvcjQuTWFnZW50YSgpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ3B1cnBsZSc6XHJcbiAgICAgICAgICB0aGlzLmNvbG9yID0gQ29sb3I0LlB1cnBsZSgpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ3JlZCc6XHJcbiAgICAgICAgICB0aGlzLmNvbG9yID0gQ29sb3I0LlJlZCgpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGNhc2UgJ3RlYWwnOlxyXG4gICAgICAgICAgdGhpcy5jb2xvciA9IENvbG9yNC5UZWFsKClcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAneWVsbG93JzpcclxuICAgICAgICAgIHRoaXMuY29sb3IgPSBDb2xvcjQuWWVsbG93KClcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgY2FzZSAnd2hpdGUnOlxyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICB0aGlzLmNvbG9yID0gQ29sb3I0LldoaXRlKClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZXhwb3J0IHR5cGUgTWVzc2FnZU9wdGlvbnMgPSB7XHJcbiAgICBjb2xvcj86IHN0cmluZ1xyXG4gICAgZm9udFNpemU/OiBudW1iZXJcclxuICAgIGRlbGF5PzogbnVtYmVyXHJcbiAgICBmYWRlU3BlZWQ/OiBudW1iZXJcclxuICB9XHJcbn1cclxuIl19