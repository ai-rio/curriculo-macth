/**
 * Blog Improvements Test Script
 * 
 * This script helps test the blog improvements using Chrome Dev Tools.
 * Run this in the browser console on a blog post page.
 */

// Test 1: Check for console errors
console.log('=== Testing Blog Improvements ===');
console.log('1. Checking for console errors...');
const originalError = console.error;
let errorCount = 0;
console.error = function(...args) {
  errorCount++;
  originalError.apply(console, args);
};

// Test 2: Verify MDX components are rendered
console.log('2. Verifying MDX components...');
const checkComponent = (selector, name) => {
  const element = document.querySelector(selector);
  if (element) {
    console.log(`✓ ${name} component found`);
    return true;
  } else {
    console.error(`✗ ${name} component missing`);
    return false;
  }
};

// Test typography hierarchy
checkComponent('h1', 'H1 Heading');
checkComponent('h2', 'H2 Heading');
checkComponent('h3', 'H3 Heading');
checkComponent('h4', 'H4 Heading');

// Test enhanced elements
checkComponent('blockquote', 'Blockquote');
checkComponent('pre code', 'Code Block');
checkComponent('table', 'Table');
checkComponent('ul', 'Unordered List');
checkComponent('ol', 'Ordered List');

// Test 3: Check Table of Contents
console.log('3. Checking Table of Contents...');
const toc = document.querySelector('nav a[href^="#"]');
if (toc) {
  console.log('✓ Table of Contents found');
  
  // Test TOC links
  const tocLinks = document.querySelectorAll('nav a[href^="#"]');
  console.log(`Found ${tocLinks.length} TOC links`);
  
  // Test smooth scrolling
  tocLinks.forEach((link, index) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        console.log(`✓ TOC link ${index + 1} points to valid element: ${targetId}`);
      } else {
        console.error(`✗ TOC link ${index + 1} points to missing element: ${targetId}`);
      }
    });
  });
} else {
  console.log('ℹ Table of Contents not found (may not be needed for short posts)');
}

// Test 4: Check syntax highlighting
console.log('4. Checking syntax highlighting...');
const codeBlocks = document.querySelectorAll('pre code');
codeBlocks.forEach((block, index) => {
  if (block.classList.contains('hljs')) {
    console.log(`✓ Code block ${index + 1} has syntax highlighting`);
  } else {
    console.log(`ℹ Code block ${index + 1} may not have syntax highlighting`);
  }
});

// Test 5: Check responsive design
console.log('5. Checking responsive design...');
const checkResponsive = () => {
  const width = window.innerWidth;
  console.log(`Current viewport width: ${width}px`);
  
  // Check if content adapts to viewport
  const content = document.querySelector('.prose, .max-w-none');
  if (content) {
    const contentWidth = content.offsetWidth;
    console.log(`Content width: ${contentWidth}px`);
    
    if (contentWidth <= width) {
      console.log('✓ Content is responsive');
    } else {
      console.warn('⚠ Content may overflow on small screens');
    }
  }
};

checkResponsive();

// Test 6: Check accessibility
console.log('6. Checking accessibility...');
const checkAccessibility = () => {
  // Check for alt text on images
  const images = document.querySelectorAll('img');
  let imagesWithoutAlt = 0;
  images.forEach(img => {
    if (!img.alt) {
      imagesWithoutAlt++;
    }
  });
  
  if (imagesWithoutAlt === 0) {
    console.log('✓ All images have alt text');
  } else {
    console.warn(`⚠ ${imagesWithoutAlt} images missing alt text`);
  }
  
  // Check for heading hierarchy
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let lastLevel = 0;
  let hierarchyError = false;
  
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1));
    if (level > lastLevel + 1) {
      hierarchyError = true;
    }
    lastLevel = level;
  });
  
  if (!hierarchyError) {
    console.log('✓ Heading hierarchy is correct');
  } else {
    console.warn('⚠ Heading hierarchy may have issues');
  }
  
  // Check for proper link attributes
  const externalLinks = document.querySelectorAll('a[href^="http"]');
  externalLinks.forEach(link => {
    if (!link.getAttribute('rel')?.includes('noopener')) {
      console.warn('⚠ External link missing rel="noopener"');
    }
    if (!link.getAttribute('target')) {
      console.warn('⚠ External link missing target="_blank"');
    }
  });
};

checkAccessibility();

// Test 7: Performance check
console.log('7. Checking performance...');
const checkPerformance = () => {
  // Check Core Web Vitals if available
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0];
    const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
    console.log(`Page load time: ${loadTime}ms`);
    
    if (loadTime < 3000) {
      console.log('✓ Good load time');
    } else if (loadTime < 5000) {
      console.log('⚠ Moderate load time');
    } else {
      console.warn('⚠ Slow load time');
    }
  }
  
  // Check for unused CSS (simplified)
  const stylesheets = Array.from(document.stylesheets);
  console.log(`Found ${stylesheets.length} stylesheets`);
};

checkPerformance();

// Test 8: Interactive elements
console.log('8. Checking interactive elements...');
const checkInteractives = () => {
  // Check if links are clickable
  const links = document.querySelectorAll('a');
  console.log(`Found ${links.length} links`);
  
  // Check if buttons are clickable
  const buttons = document.querySelectorAll('button');
  console.log(`Found ${buttons.length} buttons`);
  
  // Check for hover states
  const hoverElements = document.querySelectorAll('a, button');
  console.log(`Found ${hoverElements.length} interactive elements`);
};

checkInteractives();

// Summary
setTimeout(() => {
  console.log('\n=== Test Summary ===');
  console.log(`Total console errors: ${errorCount}`);
  
  if (errorCount === 0) {
    console.log('✓ No console errors detected');
  } else {
    console.warn(`⚠ ${errorCount} console errors detected`);
  }
  
  console.log('\n=== Manual Checks Required ===');
  console.log('1. Verify visual appearance matches design');
  console.log('2. Test mobile responsiveness by resizing the window');
  console.log('3. Test keyboard navigation (Tab, Enter, Space)');
  console.log('4. Test screen reader compatibility');
  console.log('5. Verify social sharing functionality');
  console.log('6. Test related posts links');
  console.log('7. Verify smooth scrolling behavior');
  
  console.log('\n=== Performance Metrics ===');
  if ('performance' in window) {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log(`DOM Content Loaded: ${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms`);
    console.log(`Page Load: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
  }
  
  // Restore original console.error
  console.error = originalError;
}, 1000);

// Helper function to simulate mobile view
function simulateMobileView() {
  console.log('Simulating mobile view...');
  document.body.style.width = '375px';
  document.body.style.maxWidth = '100%';
  checkResponsive();
}

// Helper function to test dark mode
function testDarkMode() {
  console.log('Testing dark mode...');
  document.documentElement.classList.add('dark');
  setTimeout(() => {
    console.log('Dark mode applied. Check visual appearance.');
  }, 100);
}

// Export helper functions for manual testing
window.blogTests = {
  simulateMobileView,
  testDarkMode,
  checkResponsive,
  checkAccessibility
};

console.log('\nHelper functions available in window.blogTests');
console.log('Run blogTests.simulateMobileView() to test mobile responsiveness');
console.log('Run blogTests.testDarkMode() to test dark mode');