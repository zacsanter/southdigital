<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta http-equiv="Content-Style-Type" content="text/css">
  <title></title>
  <meta name="Generator" content="Cocoa HTML Writer">
  <meta name="CocoaVersion" content="2299.6">
  <style type="text/css">
    p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Helvetica; -webkit-text-stroke: #000000; min-height: 14.0px}
    p.p2 {margin: 0.0px 0.0px 0.0px 0.0px; font: 12.0px Helvetica; -webkit-text-stroke: #000000}
    span.s1 {font-kerning: none}
  </style>
</head>
<body>
<p class="p1"><span class="s1"></span><br></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">  </span>document.addEventListener('DOMContentLoaded', function() {</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span>const elements = document.querySelectorAll('.reveal');</span></p>
<p class="p1"><span class="s1"></span><br></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span>elements.forEach(element =&gt; {</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">      </span>element.classList.remove('reveal');</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span>});</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">  </span>});</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span></span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">  </span>function isInViewport(element) {</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span>const bounding = element.getBoundingClientRect();</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span>const windowHeight = window.innerHeight || document.documentElement.clientHeight;</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span>const threshold = windowHeight * 0.06; // 6% of the viewport height</span></p>
<p class="p1"><span class="s1"></span><br></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span>return (</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">      </span>bounding.top + threshold &lt;= windowHeight &amp;&amp;</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">      </span>bounding.bottom &gt;= threshold</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span>);</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">  </span>}</span></p>
<p class="p1"><span class="s1"></span><br></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">  </span>function handleViewportAnimations() {</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span>const elements = document.querySelectorAll('.fadein, .fadeup, .fadedown, .fadeleft, .faderight, .scalein');</span></p>
<p class="p1"><span class="s1"></span><br></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span>elements.forEach(element =&gt; {</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">      </span>if (isInViewport(element)) {</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">        </span>element.classList.add('in-viewport');</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">      </span>}</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span>});</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">  </span>}</span></p>
<p class="p1"><span class="s1"></span><br></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">  </span>function init() {</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span>// Initial check for elements in viewport</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span>handleViewportAnimations();</span></p>
<p class="p1"><span class="s1"></span><br></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span>// Add event listener to check for elements in viewport on scroll</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">    </span>window.addEventListener('scroll', handleViewportAnimations);</span></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">  </span>}</span></p>
<p class="p1"><span class="s1"></span><br></p>
<p class="p2"><span class="s1"><span class="Apple-converted-space">  </span>init();</span></p>
</body>
</html>
