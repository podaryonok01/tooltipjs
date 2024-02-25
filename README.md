### Add JS
####
Either
####
```javascript
    import Tooltip from 'tooltipjs';
    const myTooltip = new Tooltip({
        rootElement: "document.body",
        tooltipClass: 'tooltip-custom',
        margin: 10,
        position: 'top-center',
    });
```
####
or
```html
    <script type="text/javascript" src="lib/tooltip.js"></script>
    <script type="text/javascript">
        var myTooltip = new Tooltip({
            rootElement: "document.body",
            tooltipClass: 'tooltip-custom',
            margin: 10,
            position: 'top-center',
        });
    </script>
```